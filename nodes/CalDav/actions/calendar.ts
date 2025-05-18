import { DAVCalendar } from 'tsdav';
import { CalDavFunction } from '../interfaces/common';
import { ICalendarCreate, ICalendarResponse } from '../interfaces/calendar';
import { initClient } from '../helpers/client';

export async function findCalendar(
    context: CalDavFunction,
    client: any,
    calendarName: string,
): Promise<DAVCalendar> {
    const calendars = await getCalendars(context, client);
    const calendar = calendars.find((cal: DAVCalendar) => cal.displayName === calendarName);
    if (!calendar) {
        throw new Error(`Calendar "${calendarName}" not found`);
    }
    return calendar;
}

export async function getCalendars(
    context: CalDavFunction,
    client?: any,
): Promise<ICalendarResponse[]> {
    if (!client) {
        client = await initClient(context);
    }
    const calendars = await client.fetchCalendars();
    return calendars;
}

export async function createCalendar(
    context: CalDavFunction,
    data: ICalendarCreate,
): Promise<ICalendarResponse> {
    const client = await initClient(context);
    const credentials = await context.getCredentials('calDavBasicAuth');

    const calendar = await client.createCalendar({
        name: data.name,
        timezone: data.timezone || 'UTC',
        serverUrl: credentials.serverUrl as string,
    });

    return calendar;
}

export async function deleteCalendar(
    context: CalDavFunction,
    calendarName: string,
): Promise<{ success: boolean }> {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, calendarName);
    await client.deleteCalendar(calendar);
    return { success: true };
}
