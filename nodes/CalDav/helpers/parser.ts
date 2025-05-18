import { parseICS } from 'node-ical';
import { DAVCalendarObject } from 'tsdav';
import { IEventResponse, IAttendee } from '../interfaces/event';

export function parseEventResults(events: DAVCalendarObject[]): IEventResponse[] {
    const eventResults: IEventResponse[] = [];

    for (const event of events) {
        const eventData = parseICS(event.data);
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

                eventResults.push({
                    url: event.url,
                    etag: event.etag || '',
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
