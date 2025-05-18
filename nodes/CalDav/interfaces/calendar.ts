import { DAVCalendar } from 'tsdav';
import { IDataObject, GenericValue } from 'n8n-workflow';

export interface ICalendarCreate {
    name: string;
    timezone?: string;
}

export interface ICalendarUpdate {
    name?: string;
    timezone?: string;
}

export interface ICalendarResponse extends DAVCalendar, IDataObject {
    url: string;
    displayName: string;
    color?: string;
    description?: string;
    timezone?: string;
    [key: string]: IDataObject | GenericValue | GenericValue[] | IDataObject[] | undefined;
}
