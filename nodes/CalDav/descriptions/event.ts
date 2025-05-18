import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

// Definiere die Codex-Typen für die Event-Operationen
const createEventCodex: ICodex = {
    type: 'action',
    summary: 'Erstelle einen neuen Kalendereintrag',
    description: 'Erstellt einen neuen Termin im Kalender mit Titel, Start- und Endzeit, optional auch mit Beschreibung, Ort und Teilnehmern',
    examples: [
        'Erstelle einen Meeting-Termin für morgen von 10 bis 11 Uhr',
        'Plane einen Geburtstagstermin für den 15. Mai',
        'Füge einen Termin für das Teammeeting nächste Woche Dienstag ein'
    ]
};

const deleteEventCodex: ICodex = {
    type: 'action',
    summary: 'Lösche einen Kalendereintrag',
    description: 'Entfernt einen bestimmten Termin aus dem Kalender anhand seiner ID',
    examples: [
        'Lösche den Termin mit der ID abc123',
        'Entferne den Meeting-Termin von morgen'
    ]
};

const getEventCodex: ICodex = {
    type: 'action',
    summary: 'Hole Details eines Kalendereintrags',
    description: 'Ruft alle Details eines bestimmten Termins ab, einschließlich Titel, Zeit, Beschreibung und Teilnehmer',
    examples: [
        'Zeige mir die Details des nächsten Team-Meetings',
        'Was sind die Details für den Termin morgen um 10 Uhr?'
    ]
};

const getAllEventsCodex: ICodex = {
    type: 'action',
    summary: 'Liste alle Termine in einem Zeitraum',
    description: 'Zeigt alle Termine innerhalb eines bestimmten Zeitraums an, standardmäßig die nächsten 7 Tage wenn kein Zeitraum angegeben ist',
    examples: [
        'Zeige alle Termine für nächste Woche',
        'Liste die Termine zwischen dem 1. und 15. Mai',
        'Was sind meine nächsten Termine?',
        'Welche Termine stehen diese Woche noch an?'
    ]
};

const searchEventsCodex: ICodex = {
    type: 'action',
    summary: 'Suche nach Terminen',
    description: 'Durchsucht den Kalender nach Terminen, die bestimmte Suchbegriffe im Titel oder in der Beschreibung enthalten',
    examples: [
        'Finde alle Team-Meeting Termine',
        'Suche nach Terminen mit "Projekt" im Titel',
        'Zeige mir alle Geburtstagstermine'
    ]
};

const updateEventCodex: ICodex = {
    type: 'action',
    summary: 'Aktualisiere einen Kalendereintrag',
    description: 'Ändert die Details eines bestehenden Termins wie Titel, Zeit, Beschreibung oder Teilnehmer',
    examples: [
        'Verschiebe den Meeting-Termin auf 15 Uhr',
        'Ändere den Ort des Termins auf "Konferenzraum B"',
        'Füge einen Teilnehmer zum Meeting hinzu'
    ]
};

export const eventOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['event'],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Erstelle einen neuen Termin',
                action: 'Create an event',
                codex: createEventCodex
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Lösche einen Termin',
                action: 'Delete an event',
                codex: deleteEventCodex
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Hole Termin-Details',
                action: 'Get an event',
                codex: getEventCodex
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Liste mehrere Termine auf',
                action: 'Get many events',
                codex: getAllEventsCodex
            },
            {
                name: 'Search',
                value: 'search',
                description: 'Suche nach Terminen',
                action: 'Search for events',
                codex: searchEventsCodex
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Aktualisiere einen Termin',
                action: 'Update an event',
                codex: updateEventCodex
            },
        ],
        default: 'create',
    },
];

export const eventFields: INodeProperties[] = [
    {
        displayName: 'Calendar Name or ID',
        name: 'calendarName',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getCalendars',
        },
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'delete',
                    'get',
                    'getMany',
                    'search',
                    'update'
                ],
            },
        },
        default: '',
        required: true,
        description: 'Select the calendar to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
        codex: {
            type: 'string',
            summary: 'The calendar containing the events',
            examples: ['Work Calendar', 'personal-calendar', 'team-events'],
        },
    },
    {
        displayName: 'Event Title',
        name: 'eventTitle',
        type: 'string',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'update'
                ],
            },
        },
        default: '',
        placeholder: 'Team Meeting',
        description: 'Title/subject of the calendar event',
        required: true,
        codex: {
            type: 'string',
            summary: 'The title of the event',
            examples: ['Weekly Team Meeting', 'Project Kickoff', 'Client Call'],
        },
    },
    {
        displayName: 'Event ID',
        name: 'eventId',
        type: 'string',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'delete',
                    'get',
                    'update'
                ],
            },
        },
        default: '',
        description: 'Unique identifier of the calendar event to operate on',
        required: true,
        codex: {
            type: 'string',
            summary: 'The unique ID of the event',
            examples: ['event-123', '2024-team-meeting-1'],
        },
    },
    {
        displayName: 'Start Time',
        name: 'start',
        type: 'dateTime',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'getMany',
                    'search',
                    'update'
                ],
            },
        },
        default: '={{ $now.toISO() }}',
        description: 'Start date and time of the event (e.g. 2025-05-18T10:00:00Z)',
        required: true,
        codex: {
            type: 'string',
            summary: 'The start time of the event',
            examples: ['2024-03-15T09:00:00Z', '2024-06-20T14:30:00+02:00'],
        },
    },
    {
        displayName: 'End Time',
        name: 'end',
        type: 'dateTime',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'getMany',
                    'search',
                    'update'
                ],
            },
        },
        default: '={{ $now.plus({ hour: 1 }).toISO() }}',
        description: 'End date and time of the event (e.g. 2025-05-18T11:00:00Z)',
        required: true,
        codex: {
            type: 'string',
            summary: 'The end time of the event',
            examples: ['2024-03-15T10:00:00Z', '2024-06-20T16:30:00+02:00'],
        },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'update'
                ],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                placeholder: 'Weekly team sync meeting to discuss project progress',
                description: 'Detailed description of the calendar event',
                codex: {
                    type: 'string',
                    summary: 'The description of the event',
                    examples: ['Monthly team sync to discuss project progress', 'Client presentation for Q2 results'],
                },
            },
            {
                displayName: 'Location',
                name: 'location',
                type: 'string',
                default: '',
                placeholder: 'Conference Room A or https://meet.example.com',
                description: 'Physical location or virtual meeting link for the event',
                codex: {
                    type: 'string',
                    summary: 'The location of the event',
                    examples: ['Conference Room B', 'https://meet.google.com/abc-defg-hij', 'Main Office'],
                },
            },
        ],
    },
    {
        displayName: 'Add Attendees',
        name: 'addAttendees',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'update'
                ],
            },
        },
        default: false,
        description: 'Whether to add attendees to the event',
    },
    {
        displayName: 'Attendees',
        name: 'attendees',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'create',
                    'update'
                ],
                addAttendees: [
                    true
                ],
            },
        },
        default: {},
        options: [
            {
                name: 'attendeeFields',
                displayName: 'Attendee',
                values: [
                    {
                        displayName: 'Email',
                        name: 'email',
                        type: 'string',
                        placeholder: 'name@email.com',
                        required: true,
                        default: '',
                        description: 'Email address of the attendee',
                    },
                    {
                        displayName: 'Display Name',
                        name: 'displayName',
                        type: 'string',
                        default: '',
                        description: 'Display name of the attendee',
                    },
                    {
                        displayName: 'RSVP',
                        name: 'rsvp',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to request RSVP from this attendee',
                    },
                    {
                        displayName: 'Role',
                        name: 'role',
                        type: 'options',
                        options: [
                            {
                                name: 'Required',
                                value: 'REQ-PARTICIPANT',
                                description: 'Attendee is required',
                            },
                            {
                                name: 'Optional',
                                value: 'OPT-PARTICIPANT',
                                description: 'Attendee is optional',
                            },
                            {
                                name: 'Chair',
                                value: 'CHAIR',
                                description: 'Attendee is the chair/organizer',
                            },
                        ],
                        default: 'REQ-PARTICIPANT',
                        description: 'Role of the attendee',
                    },
                ],
            },
        ],
        description: 'Attendees to add to the event',
    },
    {
        displayName: 'Search Term',
        name: 'searchTerm',
        type: 'string',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
                operation: [
                    'search'
                ],
            },
        },
        default: '',
        description: 'Search term to filter events by title or description',
        required: true,
    },
];
