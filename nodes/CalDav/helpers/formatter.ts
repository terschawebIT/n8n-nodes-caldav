import { IAttendee } from '../interfaces/event';

export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function formatAttendees(attendees: IAttendee[]): string[] {
    return attendees.map(attendee => {
        const params = [];

        if (attendee.displayName) {
            params.push(`CN="${attendee.displayName}"`);
        }

        if (attendee.role) {
            params.push(`ROLE=${attendee.role}`);
        }

        if (attendee.rsvp !== undefined) {
            params.push(`RSVP=${attendee.rsvp ? 'TRUE' : 'FALSE'}`);
        }

        params.push('PARTSTAT=NEEDS-ACTION');

        const paramsString = params.length ? `;${params.join(';')}` : '';
        return `ATTENDEE${paramsString}:mailto:${attendee.email}`;
    });
}

export function formatEvent(
    eventData: {
        title: string;
        start: string | Date;
        end: string | Date;
        description?: string;
        location?: string;
        attendees?: IAttendee[];
        organizer?: {
            email: string;
            displayName?: string;
        };
    },
): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//n8n//CalDAV Node//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${eventData.title}`,
        `DTSTART:${formatDateTime(eventData.start)}`,
        `DTEND:${formatDateTime(eventData.end)}`,
    ];

    if (eventData.organizer) {
        const organizerName = eventData.organizer.displayName || eventData.organizer.email;
        lines.push(`ORGANIZER;CN="${organizerName}":mailto:${eventData.organizer.email}`);
    }

    if (eventData.description) {
        lines.push(`DESCRIPTION:${eventData.description}`);
    }

    if (eventData.location) {
        lines.push(`LOCATION:${eventData.location}`);
    }

    if (eventData.attendees && eventData.attendees.length > 0) {
        lines.push(...formatAttendees(eventData.attendees));
    }

    lines.push(
        'END:VEVENT',
        'END:VCALENDAR'
    );

    return lines.join('\r\n');
}
