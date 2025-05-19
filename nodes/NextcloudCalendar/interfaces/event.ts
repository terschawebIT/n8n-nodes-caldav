import { IDataObject, GenericValue } from 'n8n-workflow';
import { IAttendee } from './IAttendee';

export interface IEventBase {
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    attendees?: IAttendee[];
}

export interface IEventCreate extends IEventBase {
    calendarName: string;
}

export interface IEventUpdate extends Partial<IEventBase> {
    calendarName: string;
    eventId: string;
}

export interface IEventResponse {
    uid: string;
    url?: string;
    etag?: string;
    title?: string;
    start?: string;
    end?: string;
    description?: string;
    location?: string;
    created?: Date;
    lastModified?: Date;
    status?: string;
    organizer?: {
        email: string;
        displayName?: string;
    };
    attendees?: IAttendee[];
}
