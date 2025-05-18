import { CalDavFunction } from '../interfaces/common';
import { IEventCreate, IEventUpdate, IEventResponse } from '../interfaces/event';
import { initClient } from '../helpers/client';
import { findCalendar } from './calendar';
import { formatEvent } from '../helpers/formatter';
import { parseEventResults } from '../helpers/parser';

export async function getEvents(
    context: CalDavFunction,
    calendarName: string,
    start: string,
    end: string,
): Promise<IEventResponse[]> {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, calendarName);

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
    context: CalDavFunction,
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

    return parseEventResults(events)[0];
}

export async function createEvent(
    context: CalDavFunction,
    data: IEventCreate,
): Promise<IEventResponse> {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, data.calendarName);

    const credentials = await context.getCredentials('calDavBasicAuth');
    const organizer = {
        email: credentials.username as string,
        displayName: credentials.username as string,
    };

    const iCalString = formatEvent({ ...data, organizer });

    const calendarObject = await client.createCalendarObject({
        calendar,
        filename: `${Date.now()}.ics`,
        iCalString,
    });

    return parseEventResults([calendarObject])[0];
}

export async function updateEvent(
    context: CalDavFunction,
    data: IEventUpdate,
): Promise<IEventResponse> {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, data.calendarName);

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

    const existingEvent = events[0];
    const existingData = parseEventResults([existingEvent])[0];

    const credentials = await context.getCredentials('calDavBasicAuth');
    const organizer = {
        email: credentials.username as string,
        displayName: credentials.username as string,
    };

    const mergedData = {
        title: data.title || existingData.title,
        start: data.start || existingData.start,
        end: data.end || existingData.end,
        description: data.description !== undefined ? data.description : existingData.description,
        location: data.location !== undefined ? data.location : existingData.location,
        attendees: data.attendees || existingData.attendees,
        organizer,
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
    context: CalDavFunction,
    calendarName: string,
    eventId: string,
): Promise<{ success: boolean }> {
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
    context: CalDavFunction,
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
