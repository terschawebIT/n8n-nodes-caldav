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

export function formatEvent(data: any): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//n8n//CalDAV Node//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${data.title}`,
        `DTSTART:${new Date(data.start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        `DTEND:${new Date(data.end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    ];

    if (data.description) {
        lines.push(`DESCRIPTION:${data.description}`);
    }

    if (data.location) {
        lines.push(`LOCATION:${data.location}`);
    }

    if (data.organizer) {
        lines.push(`ORGANIZER;CN="${data.organizer.displayName}":mailto:${data.organizer.email}`);
    }

    if (data.attendees && data.attendees.length > 0) {
        lines.push(...formatAttendees(data.attendees));
    }

    lines.push(
        'END:VEVENT',
        'END:VCALENDAR'
    );

    return lines.join('\r\n');
}
