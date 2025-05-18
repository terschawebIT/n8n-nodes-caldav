import {
	IExecuteFunctions
} from 'n8n-core';

import {
	ILoadOptionsFunctions
} from 'n8n-workflow';

import {
    DAVCalendar,
    DAVClient,
    DAVCalendarObject,
    createCalendarObject,
    updateCalendarObject,
    deleteCalendarObject,
} from 'tsdav';

import {
    parseICS,
    createEvent,
    createCalendar,
} from 'node-ical';

// Interface für Teilnehmer
interface IAttendee {
    email: string;
    displayName?: string;
    rsvp?: boolean;
    role?: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'CHAIR';
}

// Helper function to initialize the DAV client
async function initClient(
    this: ILoadOptionsFunctions | IExecuteFunctions,
): Promise<DAVClient> {
    const credentials = await this.getCredentials('calDavBasicAuth');
    const client = new DAVClient({
        serverUrl: credentials.serverUrl as string,
        credentials: {
          username: credentials.username as string,
          password: credentials.password as string,
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
    });
    await client.login();
    return client;
}

// Helper function to find a calendar by name
async function findCalendar(
    this: ILoadOptionsFunctions | IExecuteFunctions,
    client: DAVClient,
    calendarName: string,
): Promise<DAVCalendar> {
    const calendars = await getCalendars.call(this, client);
    const calendar = calendars.find((cal: DAVCalendar) => cal.displayName === calendarName);
    if (!calendar) {
        throw new Error(`Calendar "${calendarName}" not found`);
    }
    return calendar;
}

// Helper function to format attendees for iCal
function formatAttendees(attendees: IAttendee[]): string[] {
    return attendees.map(attendee => {
        const params = [];

        if (attendee.displayName) {
            params.push(`CN="${attendee.displayName}"`);
        }

        if (attendee.role) {
            params.push(`ROLE=${attendee.role}`);
        }

        if (attendee.rsvp !== undefined) {
            params.push(`RSVP=${attendee.rsvp ? 'TRUE' : 'FALSE'}`);
        }

        params.push('PARTSTAT=NEEDS-ACTION');

        const paramsString = params.length ? `;${params.join(';')}` : '';
        return `ATTENDEE${paramsString}:mailto:${attendee.email}`;
    });
}

export async function getCalendars(
    this: ILoadOptionsFunctions | IExecuteFunctions,
    client?: DAVClient,
) {
    if (!client) {
        client = await initClient.call(this);
    }
    const calendars = await client.fetchCalendars();
    return calendars;
}

export async function createNewCalendar(
    this: IExecuteFunctions,
    calendarName: string,
) {
    const client = await initClient.call(this);
    const calendar = await client.createCalendar({
        name: calendarName,
        timezone: 'UTC',
        serverUrl: (await this.getCredentials('calDavBasicAuth')).serverUrl as string,
    });
    return calendar;
}

export async function deleteCalendar(
    this: IExecuteFunctions,
    calendarName: string,
) {
    const client = await initClient.call(this);
    const calendar = await findCalendar.call(this, client, calendarName);
    await client.deleteCalendar(calendar);
    return { success: true };
}

export async function getEvents(
    this: IExecuteFunctions,
    calendarName: string,
    start: string,
    end: string,
) {
    const client = await initClient.call(this);
    const calendar = await findCalendar.call(this, client, calendarName);
    const events = await client.fetchCalendarObjects({
        calendar: calendar as DAVCalendar,
        timeRange: {
            start: start,
            end: end,
        },
        expand: true
    });
    return parseEventResults(events);
}

export async function getEvent(
    this: IExecuteFunctions,
    calendarName: string,
    eventId: string,
) {
    const client = await initClient.call(this);
    const calendar = await findCalendar.call(this, client, calendarName);
    const event = await client.fetchCalendarObject({
        calendar: calendar,
        url: eventId,
    });
    return parseEventResults([event])[0];
}

export async function createEvent(
    this: IExecuteFunctions,
    calendarName: string,
    eventData: {
        title: string,
        start: string,
        end: string,
        description?: string,
        location?: string,
        attendees?: IAttendee[];
    },
): Promise<any> {
    const client = await initClient.call(this);
    const calendar = await findCalendar.call(this, client, calendarName);

    const credentials = await this.getCredentials('calDavBasicAuth');
    const organizerEmail = credentials.username as string;

    let iCalData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//n8n//CalDAV Node//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${eventData.title}`,
        `DTSTART:${new Date(eventData.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `DTEND:${new Date(eventData.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `ORGANIZER;CN="${organizerEmail}":mailto:${organizerEmail}`,
    ];

    if (eventData.description) {
        iCalData.push(`DESCRIPTION:${eventData.description}`);
    }

    if (eventData.location) {
        iCalData.push(`LOCATION:${eventData.location}`);
    }

    // Füge Teilnehmer hinzu
    if (eventData.attendees && eventData.attendees.length > 0) {
        iCalData = iCalData.concat(formatAttendees(eventData.attendees));
    }

    iCalData.push(
        'END:VEVENT',
        'END:VCALENDAR'
    );

    const calendarObject = await client.createCalendarObject({
        calendar: calendar,
        filename: `${Date.now()}.ics`,
        iCalString: iCalData.join('\r\n'),
    });

    return parseEventResults([calendarObject])[0];
}

export async function updateEvent(
    this: IExecuteFunctions,
    calendarName: string,
    eventId: string,
    eventData: {
        title?: string,
        start?: string,
        end?: string,
        description?: string,
        location?: string,
        attendees?: IAttendee[];
    },
): Promise<any> {
    const client = await initClient.call(this);
    const calendar = await findCalendar.call(this, client, calendarName);

    // Fetch existing event
    const existingEvent = await client.fetchCalendarObject({
        calendar: calendar,
        url: eventId,
    });

    const existingData = parseEventResults([existingEvent])[0];

    const credentials = await this.getCredentials('calDavBasicAuth');
    const organizerEmail = credentials.username as string;

    let iCalData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//n8n//CalDAV Node//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${eventData.title || existingData.summary}`,
        `DTSTART:${new Date(eventData.start || existingData.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `DTEND:${new Date(eventData.end || existingData.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `ORGANIZER;CN="${organizerEmail}":mailto:${organizerEmail}`,
    ];

    if (eventData.description !== undefined) {
        iCalData.push(`DESCRIPTION:${eventData.description}`);
    } else if (existingData.description) {
        iCalData.push(`DESCRIPTION:${existingData.description}`);
    }

    if (eventData.location !== undefined) {
        iCalData.push(`LOCATION:${eventData.location}`);
    } else if (existingData.location) {
        iCalData.push(`LOCATION:${existingData.location}`);
    }

    // Aktualisiere Teilnehmer
    if (eventData.attendees && eventData.attendees.length > 0) {
        iCalData = iCalData.concat(formatAttendees(eventData.attendees));
    } else if (existingData.attendees) {
        // Behalte existierende Teilnehmer bei
        iCalData = iCalData.concat(formatAttendees(existingData.attendees));
    }

    iCalData.push(
        'END:VEVENT',
        'END:VCALENDAR'
    );

    const calendarObject = await client.updateCalendarObject({
        calendarObject: existingEvent,
        iCalString: iCalData.join('\r\n'),
    });

    return parseEventResults([calendarObject])[0];
}

export async function deleteEvent(
    this: IExecuteFunctions,
    calendarName: string,
    eventId: string,
) {
    const client = await initClient.call(this);
    const calendar = await findCalendar.call(this, client, calendarName);

    await client.deleteCalendarObject({
        calendar: calendar,
        url: eventId,
    });

    return { success: true };
}

export async function searchEvents(
    this: IExecuteFunctions,
    calendarName: string,
    searchTerm: string,
    start: string,
    end: string,
) {
    const events = await getEvents.call(this, calendarName, start, end);

    return events.filter(event => {
        const searchString = searchTerm.toLowerCase();
        return (
            (event.summary && event.summary.toLowerCase().includes(searchString)) ||
            (event.description && event.description.toLowerCase().includes(searchString)) ||
            (event.location && event.location.toLowerCase().includes(searchString))
        );
    });
}

// Helper function to parse event results
function parseEventResults(events: DAVCalendarObject[]) {
    const eventResults = [];
    for (const event of events) {
        const eventData = parseICS(event.data);
        for (const key in eventData) {
            if (key !== 'vcalendar') {
                const data = eventData[key] as any;

                // Parse attendees from iCal format
                const attendees = [];
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

                eventResults.push({
                    url: event.url,
                    etag: event.etag,
                    ...data,
                    attendees,
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
