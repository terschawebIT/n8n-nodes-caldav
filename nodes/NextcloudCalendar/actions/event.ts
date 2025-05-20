import { IExecuteFunctions } from 'n8n-workflow';
import { initClient } from '../helpers/client';
import { IEventCreate, IEventUpdate, IEventResponse } from '../interfaces/event';
import { findCalendar } from './calendar';
import { parseICalEvent } from '../helpers/parser';

interface IAttendeeICal {
    displayName?: string;
    role?: string;
    rsvp?: boolean;
    email?: string;
}

interface IEventICal {
    uid?: string;
    title?: string;
    start?: string | Date;
    end?: string | Date;
    description?: string;
    location?: string;
    attendees?: IAttendeeICal[];
    credentials?: { username?: string; email?: string };
}

export async function getEvents(
    context: IExecuteFunctions,
    calendarName: string,
    start: string,
    end: string,
) {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, calendarName);

    const response = await client.fetchCalendarObjects({
        calendar,
        timeRange: {
            start: start,
            end: end,
        },
    });

    return response.map(parseICalEvent);
}

export async function getEvent(
    context: IExecuteFunctions,
    calendarName: string,
    eventId: string,
): Promise<IEventResponse> {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, calendarName);

    const events = await client.fetchCalendarObjects({
        calendar,
        filters: [{
            'comp-filter': {
                _attributes: {
                    name: 'VCALENDAR',
                },
                'comp-filter': {
                    _attributes: {
                        name: 'VEVENT',
                        test: 'allof',
                    },
                    'prop-filter': {
                        _attributes: {
                            name: 'UID',
                            test: 'equals',
                        },
                        'text-match': {
                            _attributes: {
                                'match-type': 'equals',
                            },
                            _text: eventId,
                        },
                    },
                },
            },
        }],
    });

    if (!events || events.length === 0) {
        throw new Error(`Event with ID "${eventId}" not found`);
    }

    return parseICalEvent(events[0]);
}

export async function createEvent(
    context: IExecuteFunctions,
    data: IEventCreate,
) {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, data.calendarName);
    const credentials = await context.getCredentials('nextcloudCalendarApi');

    const event = {
        ...data,
        uid: `n8n-${Date.now()}@nextcloud-calendar`,
        credentials: credentials,
    };

    // Spezielle Header für Einladungen
    const headers: Record<string, string> = {};
    if (data.attendees && data.attendees.length > 0) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
        headers['Schedule-Reply'] = 'true';
        headers['Prefer'] = 'return=representation';
    }

    const response = await client.createCalendarObject({
        calendar,
        filename: `${event.uid}.ics`,
        iCalString: generateICalString(event),
        headers: headers,
    });

    // Verbesserte Rückgabe als eigenes Objekt
    const result = {
        success: true,
        message: 'Termin erfolgreich erstellt',
        uid: event.uid,
        details: {
            title: event.title,
            start: event.start,
            end: event.end,
            attendeesCount: event.attendees?.length || 0,
        }
    };

    if (response && typeof response === 'object') {
        if ('url' in response) {
            (result as { url?: string; etag?: string }).url = response.url;
        }
        if ('etag' in response) {
            (result as { url?: string; etag?: string }).etag = String(response.etag);
        }
    }

    return result;
}

export async function updateEvent(
    context: IExecuteFunctions,
    data: IEventUpdate,
) {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, data.calendarName);

    const existingEvent = await getEvent(context, data.calendarName, data.eventId);
    const updatedEvent = {
        ...existingEvent,
        ...data,
    };

    const events = await client.fetchCalendarObjects({
        calendar,
        filters: [{
            'comp-filter': {
                _attributes: {
                    name: 'VCALENDAR',
                },
                'comp-filter': {
                    _attributes: {
                        name: 'VEVENT',
                        test: 'allof',
                    },
                    'prop-filter': {
                        _attributes: {
                            name: 'UID',
                            test: 'equals',
                        },
                        'text-match': {
                            _attributes: {
                                'match-type': 'equals',
                            },
                            _text: data.eventId,
                        },
                    },
                },
            },
        }],
    });

    if (!events || events.length === 0) {
        throw new Error(`Event with ID "${data.eventId}" not found`);
    }

    // Spezielle Header für Einladungen
    const headers: Record<string, string> = {};
    if (data.attendees && data.attendees.length > 0) {
        headers['X-Requested-With'] = 'XMLHttpRequest';
        headers['Schedule-Reply'] = 'true';
        headers['Prefer'] = 'return=representation';
    }

    const response = await client.updateCalendarObject({
        calendarObject: {
            ...events[0],
            data: generateICalString(updatedEvent),
        },
        headers: headers,
    });

    // Verbesserte Rückgabe
    const result = {
        success: true,
        message: 'Termin erfolgreich aktualisiert',
        uid: data.eventId,
        details: {
            title: updatedEvent.title,
            start: updatedEvent.start,
            end: updatedEvent.end,
            attendeesCount: updatedEvent.attendees?.length || 0,
        }
    };

    if (response && typeof response === 'object') {
        if ('url' in response) {
            (result as { url?: string; etag?: string }).url = response.url;
        }
        if ('etag' in response) {
            (result as { url?: string; etag?: string }).etag = String(response.etag);
        }
    }

    return result;
}

export async function deleteEvent(
    context: IExecuteFunctions,
    calendarName: string,
    eventId: string,
) {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, calendarName);

    const events = await client.fetchCalendarObjects({
        calendar,
        filters: [{
            'comp-filter': {
                _attributes: {
                    name: 'VCALENDAR',
                },
                'comp-filter': {
                    _attributes: {
                        name: 'VEVENT',
                        test: 'allof',
                    },
                    'prop-filter': {
                        _attributes: {
                            name: 'UID',
                            test: 'equals',
                        },
                        'text-match': {
                            _attributes: {
                                'match-type': 'equals',
                            },
                            _text: eventId,
                        },
                    },
                },
            },
        }],
    });

    if (!events || events.length === 0) {
        throw new Error(`Event with ID "${eventId}" not found`);
    }

    await client.deleteCalendarObject({
        calendarObject: events[0],
    });

    return { success: true };
}

export async function searchEvents(
    context: IExecuteFunctions,
    calendarName: string,
    searchTerm: string,
    start: string,
    end: string,
): Promise<IEventResponse[]> {
    const events = await getEvents(context, calendarName, start, end);

    return events.filter(event => {
        const searchString = searchTerm.toLowerCase();
        return (
            (event.title && event.title.toLowerCase().includes(searchString)) ||
            (event.description && event.description.toLowerCase().includes(searchString)) ||
            (event.location && event.location.toLowerCase().includes(searchString))
        );
    });
}

function generateICalString(event: IEventICal) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const startDate = event.start ? new Date(event.start) : new Date();
    const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
    let iCalString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//n8n//Nextcloud Calendar Node//EN
METHOD:REQUEST
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${event.uid}
DTSTAMP:${timestamp}
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:OPAQUE
`;

    if (event.description) {
        iCalString += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
    }

    if (event.location) {
        iCalString += `LOCATION:${event.location}\n`;
    }

    iCalString += `CLASS:PUBLIC\n`;
    iCalString += `X-NC-GROUP-ID:${event.uid}\n`;
    iCalString += `X-NEXTCLOUD-ATTENDEE-HANDLING:TRUE\n`;

    const credentials = event.credentials || { username: 'Organizer', email: undefined };
    const username = typeof credentials.username === 'string' ? credentials.username : 'Organizer';
    const email = typeof credentials.email === 'string' ? credentials.email : `${username}@example.com`;

    iCalString += `ORGANIZER;CN=${username};RSVP=FALSE;PARTSTAT=ACCEPTED;ROLE=CHAIR:mailto:${email}\n`;

    if (event.attendees && event.attendees.length > 0) {
        event.attendees.forEach((attendee) => {
            let attendeeString = 'ATTENDEE;CUTYPE=INDIVIDUAL';
            if (typeof attendee.displayName === 'string') {
                attendeeString += `;CN=${attendee.displayName}`;
            }
            attendeeString += `;ROLE=${attendee.role || 'REQ-PARTICIPANT'}`;
            attendeeString += ';PARTSTAT=NEEDS-ACTION';
            if (attendee.rsvp) {
                attendeeString += ';RSVP=TRUE';
            } else {
                attendeeString += ';RSVP=FALSE';
            }
            attendeeString += ';SCHEDULE-STATUS=1.1';
            attendeeString += `:mailto:${typeof attendee.email === 'string' ? attendee.email : ''}\n`;
            iCalString += attendeeString;
        });
    }

    iCalString += `END:VEVENT
END:VCALENDAR`;

    return iCalString;
}
