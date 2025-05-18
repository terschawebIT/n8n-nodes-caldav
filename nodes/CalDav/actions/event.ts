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

    const event = await client.fetchCalendarObject({
        calendar,
        url: eventId,
    });

    return parseEventResults([event])[0];
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

    // Fetch existing event
    const existingEvent = await client.fetchCalendarObject({
        calendar,
        url: data.eventId,
    });

    const existingData = parseEventResults([existingEvent])[0];

    const credentials = await context.getCredentials('calDavBasicAuth');
    const organizer = {
        email: credentials.username as string,
        displayName: credentials.username as string,
    };

    // Merge existing data with updates
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
        calendarObject: existingEvent,
        iCalString,
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

    await client.deleteCalendarObject({
        calendar,
        url: eventId,
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
