import { IAttendee } from './event';

export interface ICalendarBase {
    displayName: string;
    color?: string;
    timezone?: string;
    description?: string;
    visibility?: 'private' | 'public';
}

export interface ICalendarCreate extends ICalendarBase {
    displayName: string;
}

export interface ICalendarUpdate extends ICalendarBase {
    // Zusätzliche Felder für die Kalenderaktualisierung
}

export interface ICalendarResponse extends ICalendarBase {
    url: string;
    ctag?: string;
    resourcetype?: string[];
    syncToken?: string;
    components?: string[];
}

export interface IEventCreate {
    calendarName: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    attendees?: IAttendee[];
    room?: string;
    resources?: string[];
    alarmType?: 'EMAIL' | 'DISPLAY';
}

export interface IEventResponse {
    id: string;
    calendarName: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    attendees?: IAttendee[];
    room?: string;
    resources?: string[];
    url: string;
    etag?: string;
    groupId?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
}
