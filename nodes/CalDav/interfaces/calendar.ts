import { DAVCalendar } from 'tsdav';
import { IDataObject, GenericValue } from 'n8n-workflow';

export interface ICalendarCreate {
    name: string;
    timezone?: string;
    color?: string;
    description?: string;
}

export interface ICalendarUpdate {
    name?: string;
    timezone?: string;
}

export interface ICalendarResponse extends DAVCalendar, IDataObject {
    id: string;
    name: string;
    timezone?: string;
    color?: string;
    description?: string;
    url: string;
    owner?: string;
    isShared?: boolean;
    permissions?: string[];
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

export interface IAttendee {
    email: string;
    displayName?: string;
    role?: 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'CHAIR';
    rsvp?: boolean;
    status?: 'NEEDS-ACTION' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
}
