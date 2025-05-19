import { DAVCalendarObject, DAVResponse } from 'tsdav';
import { IEventResponse } from '../interfaces/event';
import { IAttendee } from '../interfaces/IAttendee';

type CalendarObjectType = DAVCalendarObject | DAVResponse;

interface ICalParams {
    [key: string]: string;
}

function parseICalDate(date: string): Date {
    // Format: YYYYMMDDTHHMMSSZ or YYYYMMDD
    const year = parseInt(date.substr(0, 4));
    const month = parseInt(date.substr(4, 2)) - 1;
    const day = parseInt(date.substr(6, 2));
    
    if (date.includes('T')) {
        const hour = parseInt(date.substr(9, 2));
        const minute = parseInt(date.substr(11, 2));
        const second = parseInt(date.substr(13, 2));
        return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    
    return new Date(Date.UTC(year, month, day));
}

function parseICS(icsData: string): any {
    const lines = icsData.split('\n').map(line => line.trim());
    const event: any = {};
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('BEGIN:VEVENT')) {
            continue;
        }
        if (line.startsWith('END:VEVENT')) {
            break;
        }
        
        const [key, ...values] = line.split(':');
        const value = values.join(':');
        
        switch (key) {
            case 'UID':
                event.uid = value;
                break;
            case 'SUMMARY':
                event.summary = value;
                break;
            case 'DESCRIPTION':
                event.description = value;
                break;
            case 'LOCATION':
                event.location = value;
                break;
            case 'DTSTART':
                event.start = parseICalDate(value);
                break;
            case 'DTEND':
                event.end = parseICalDate(value);
                break;
            case 'CREATED':
                event.created = parseICalDate(value);
                break;
            case 'LAST-MODIFIED':
                event.lastmodified = parseICalDate(value);
                break;
            case 'STATUS':
                event.status = value;
                break;
            case 'ATTENDEE':
                if (!event.attendee) {
                    event.attendee = [];
                }
                const [params, email] = value.split('mailto:');
                const attendee = {
                    val: `mailto:${email}`,
                    params: {} as ICalParams
                };
                if (params) {
                    params.split(';').forEach((param: string) => {
                        const [paramKey, paramValue] = param.split('=');
                        if (paramKey && paramValue) {
                            attendee.params[paramKey] = paramValue;
                        }
                    });
                }
                event.attendee.push(attendee);
                break;
            case 'ORGANIZER':
                const [orgParams, orgEmail] = value.split('mailto:');
                event.organizer = {
                    val: `mailto:${orgEmail}`,
                    params: {} as ICalParams
                };
                if (orgParams) {
                    orgParams.split(';').forEach((param: string) => {
                        const [paramKey, paramValue] = param.split('=');
                        if (paramKey && paramValue) {
                            event.organizer.params[paramKey] = paramValue;
                        }
                    });
                }
                break;
        }
    }
    
    return { vevent: event };
}

export function parseEventResults(events: CalendarObjectType[]): IEventResponse[] {
    const eventResults: IEventResponse[] = [];

    for (const event of events) {
        const eventData = 'data' in event ? event.data : (event as any).props?.['calendar-data']?._text;
        if (!eventData) {
            continue;
        }

        const parsedData = parseICS(eventData);
        const eventInfo = parsedData.vevent;

        // Parse attendees from iCal format
        const attendees: IAttendee[] = [];
        if (eventInfo.attendee) {
            const attendeeList = Array.isArray(eventInfo.attendee) ? eventInfo.attendee : [eventInfo.attendee];
            for (const attendee of attendeeList) {
                const email = attendee.val.replace('mailto:', '');
                const params = attendee.params || {};
                attendees.push({
                    email,
                    displayName: params.CN,
                    role: params.ROLE || 'REQ-PARTICIPANT',
                    rsvp: params.RSVP === 'TRUE',
                    status: params.PARTSTAT || 'NEEDS-ACTION',
                });
            }
        }

        // Parse organizer
        let organizer;
        if (eventInfo.organizer) {
            organizer = {
                email: eventInfo.organizer.val.replace('mailto:', ''),
                displayName: eventInfo.organizer.params?.CN,
            };
        }

        const url = 'url' in event ? event.url : (event as any).href;
        const etag = 'etag' in event ? event.etag : (event as any).props?.getetag?._text;

        eventResults.push({
            url: url || '',
            etag: etag || '',
            uid: eventInfo.uid,
            title: eventInfo.summary,
            start: eventInfo.start?.toISOString(),
            end: eventInfo.end?.toISOString(),
            description: eventInfo.description,
            location: eventInfo.location,
            created: eventInfo.created,
            lastModified: eventInfo.lastmodified,
            status: eventInfo.status,
            attendees,
            organizer,
        });
    }

    return eventResults.sort((a, b) => {
        const startA = a?.start ?? '';
        const startB = b?.start ?? '';
        
        if (startA < startB) {
            return -1;
        } else if (startA > startB) {
            return 1;
        } else {
            return 0;
        }
    });
}

export function parseICalEvent(calendarObject: DAVCalendarObject): IEventResponse {
    const icalData = parseICS(calendarObject.data);
    const event = icalData.vevent;

    // Vollständigere Antwort zurückgeben
    const response: IEventResponse = {
        uid: event.uid,
        title: event.summary,
        start: event.start?.toISOString(),
        end: event.end?.toISOString(),
        description: event.description,
        location: event.location,
        url: calendarObject.url,
        etag: calendarObject.etag,
        created: event.created,
        lastModified: event.lastmodified,
        status: event.status,
        // Vollständige Informationen über Organisator zurückgeben
        organizer: event.organizer ? {
            email: event.organizer.val.replace('mailto:', ''),
            displayName: event.organizer.params?.CN,
        } : undefined,
        // Vollständige Informationen über Teilnehmer zurückgeben
        attendees: event.attendee ? Array.isArray(event.attendee) ?
            event.attendee.map((a: any) => ({
                email: a.val.replace('mailto:', ''),
                displayName: a.params?.CN,
                role: a.params?.ROLE,
                status: a.params?.PARTSTAT,
                rsvp: a.params?.RSVP === 'TRUE',
            })) :
            [{
                email: event.attendee.val.replace('mailto:', ''),
                displayName: event.attendee.params?.CN,
                role: event.attendee.params?.ROLE,
                status: event.attendee.params?.PARTSTAT,
                rsvp: event.attendee.params?.RSVP === 'TRUE',
            }] : undefined,
    };
    
    return response;
}
