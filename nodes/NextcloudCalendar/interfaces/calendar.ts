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
