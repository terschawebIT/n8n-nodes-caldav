import { parseICS } from 'node-ical';
import { DAVCalendarObject, DAVResponse } from 'tsdav';
import { IEventResponse, IAttendee } from '../interfaces/event';

type CalendarObjectType = DAVCalendarObject | DAVResponse;

export function parseEventResults(events: CalendarObjectType[]): IEventResponse[] {
    const eventResults: IEventResponse[] = [];

    for (const event of events) {
        const data = 'data' in event ? event.data : (event as any).props?.['calendar-data']?._text;
        if (!data) {
            continue;
        }

        const eventData = parseICS(data);
        for (const key in eventData) {
            if (key !== 'vcalendar') {
                const data = eventData[key] as any;

                // Parse attendees from iCal format
                const attendees: IAttendee[] = [];
                if (data.attendee) {
                    const attendeeList = Array.isArray(data.attendee) ? data.attendee : [data.attendee];
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
                if (data.organizer) {
                    organizer = {
                        email: data.organizer.val.replace('mailto:', ''),
                        displayName: data.organizer.params?.CN,
                    };
                }

                const url = 'url' in event ? event.url : (event as any).href;
                const etag = 'etag' in event ? event.etag : (event as any).props?.getetag?._text;

                eventResults.push({
                    url: url || '',
                    etag: etag || '',
                    uid: data.uid,
                    title: data.summary,
                    start: data.start.toISOString(),
                    end: data.end.toISOString(),
                    description: data.description,
                    location: data.location,
                    created: data.created,
                    lastModified: data.lastmodified,
                    status: data.status,
                    attendees,
                    organizer,
                });
            }
        }
    }

    return eventResults.sort((a, b) => {
        if (a?.start < b?.start) {
            return -1;
        } else if (a?.start > b?.start) {
            return 1;
        } else {
            return 0;
        }
    });
}
