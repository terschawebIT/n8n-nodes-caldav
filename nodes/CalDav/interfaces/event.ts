import { IDataObject, GenericValue } from 'n8n-workflow';

export interface IAttendee {
    email: string;
    displayName?: string;
    rsvp?: boolean;
    role?: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'CHAIR';
    status?: string;
}

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

export interface IEventUpdate extends IEventBase {
    calendarName: string;
    eventId: string;
}

export interface IEventResponse extends IEventBase, IDataObject {
    url: string;
    etag: string;
    uid: string;
    created: Date;
    lastModified: Date;
    status?: string;
    organizer?: {
        email: string;
        displayName?: string;
    };
    [key: string]: IDataObject | GenericValue | GenericValue[] | IDataObject[] | undefined;
}
