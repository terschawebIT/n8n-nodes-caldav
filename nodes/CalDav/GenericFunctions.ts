import {
	IExecuteFunctions
} from 'n8n-core';

import {
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import {
    DAVCalendar,
    DAVClient,
} from 'tsdav';

import { initClient } from './helpers/client';
import { formatEvent } from './helpers/formatter';
import { parseEventResults } from './helpers/parser';

// Interface für Teilnehmer
interface IAttendee {
    email: string;
    displayName?: string;
    rsvp?: boolean;
    role?: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'CHAIR';
}

// Helper function to find a calendar by name
export async function findCalendar(
    this: ILoadOptionsFunctions | IExecuteFunctions,
    client: DAVClient,
    calendarName: string,
): Promise<DAVCalendar> {
    const calendars = await getCalendars.call(this);
    const calendar = calendars.find((cal: DAVCalendar) => cal.displayName === calendarName);
    if (!calendar) {
        throw new Error(`Calendar "${calendarName}" not found`);
    }
    return calendar;
}

export async function getCalendars(
    this: ILoadOptionsFunctions | IExecuteFunctions,
) {
    const client = await initClient(this, this);
    const calendars = await client.fetchCalendars();
    return calendars;
}

export async function createNewCalendar(
    this: IExecuteFunctions,
    calendarName: string,
) {
    const client = await initClient(this, this);
    const calendars = await client.fetchCalendars();
    const homeUrl = calendars[0]?.url?.split('/').slice(0, -1).join('/') || '';

    await client.createCalendarObject({
        calendar: {
            url: `${homeUrl}/${calendarName}/`,
            displayName: calendarName,
        },
        filename: 'calendar.ics',
        iCalString: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//n8n//CalDAV Node//EN
NAME:${calendarName}
X-WR-TIMEZONE:UTC
END:VCALENDAR`,
    });

    return { success: true };
}

export async function deleteCalendar(
    this: IExecuteFunctions,
    calendarName: string,
) {
    const client = await initClient(this, this);
    const calendar = await findCalendar.call(this, client, calendarName);

    await client.deleteCalendarObject({
        calendarObject: {
            url: calendar.url,
            data: '',
            etag: '',
        },
    });

    return { success: true };
}

export async function getEvents(
    this: IExecuteFunctions,
    calendarName: string,
    start: string,
    end: string,
) {
    const client = await initClient(this, this);
    const calendar = await findCalendar.call(this, client, calendarName);
    const events = await client.fetchCalendarObjects({
        calendar,
        timeRange: {
            start,
            end,
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
    const client = await initClient(this, this);
    const calendar = await findCalendar.call(this, client, calendarName);
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

    return parseEventResults(events)[0];
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
    const client = await initClient(this, this);
    const calendar = await findCalendar.call(this, client, calendarName);

    const credentials = await this.getCredentials('calDavBasicAuth');
    const organizerEmail = credentials.username as string;

    const iCalString = formatEvent({
        ...eventData,
        organizer: {
            email: organizerEmail,
            displayName: organizerEmail,
        },
    });

    const calendarObject = await client.createCalendarObject({
        calendar,
        filename: `${Date.now()}.ics`,
        iCalString,
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
    const client = await initClient(this, this);
    const calendar = await findCalendar.call(this, client, calendarName);

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

    const existingEvent = events[0];
    const existingData = parseEventResults([existingEvent])[0];

    const credentials = await this.getCredentials('calDavBasicAuth');
    const organizerEmail = credentials.username as string;

    const mergedData = {
        title: eventData.title || existingData.title,
        start: eventData.start || existingData.start,
        end: eventData.end || existingData.end,
        description: eventData.description !== undefined ? eventData.description : existingData.description,
        location: eventData.location !== undefined ? eventData.location : existingData.location,
        attendees: eventData.attendees || existingData.attendees,
        organizer: {
            email: organizerEmail,
            displayName: organizerEmail,
        },
    };

    const iCalString = formatEvent(mergedData);

    const calendarObject = await client.updateCalendarObject({
        calendarObject: {
            ...existingEvent,
            data: iCalString,
        },
    });

    return parseEventResults([calendarObject])[0];
}

export async function deleteEvent(
    this: IExecuteFunctions,
    calendarName: string,
    eventId: string,
) {
    const client = await initClient(this, this);
    const calendar = await findCalendar.call(this, client, calendarName);

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
            (event.title && typeof event.title === 'string' && event.title.toLowerCase().includes(searchString)) ||
            (event.description && typeof event.description === 'string' && event.description.toLowerCase().includes(searchString)) ||
            (event.location && typeof event.location === 'string' && event.location.toLowerCase().includes(searchString))
        );
    });
}
