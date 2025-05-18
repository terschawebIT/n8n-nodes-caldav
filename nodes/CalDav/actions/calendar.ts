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

    // Erstelle einen neuen Kalender als CalDAV-Sammlung
    const calendars = await client.fetchCalendars();
    const homeUrl = calendars[0]?.url?.split('/').slice(0, -1).join('/') || '';

    const calendarObject = await client.createCalendarObject({
        calendar: {
            url: `${homeUrl}/${data.name}/`,
            displayName: data.name,
        },
        filename: 'calendar.ics',
        iCalString: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//n8n//CalDAV Client//EN
NAME:${data.name}
X-WR-TIMEZONE:${data.timezone || 'UTC'}
END:VCALENDAR`,
    });

    return {
        url: calendarObject.url,
        displayName: data.name,
        timezone: data.timezone || 'UTC',
    } as ICalendarResponse;
}

export async function deleteCalendar(
    context: CalDavFunction,
    calendarName: string,
): Promise<{ success: boolean }> {
    const client = await initClient(context);
    const calendar = await findCalendar(context, client, calendarName);

    await client.deleteCalendarObject({
        calendarObject: {
            url: calendar.url,
            data: '',
            etag: '',
        },
    });

    return { success: true };
}
