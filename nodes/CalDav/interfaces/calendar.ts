import { DAVCalendar } from 'tsdav';

export interface ICalendarCreate {
    name: string;
    timezone?: string;
}

export interface ICalendarUpdate {
    name?: string;
    timezone?: string;
}

export interface ICalendarResponse extends DAVCalendar {
    url: string;
    displayName: string;
    color?: string;
    description?: string;
}
