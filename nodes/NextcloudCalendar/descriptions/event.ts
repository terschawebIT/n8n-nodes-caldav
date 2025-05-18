import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

// Definiere die Codex-Typen für die Event-Operationen
const nextEventsCodex: ICodex = {
    type: 'action',
    summary: 'Zeige nächste Termine',
    description: 'Zeigt Ihre anstehenden Termine übersichtlich an. Sie können den Zeitraum flexibel wählen - von heute bis zu mehreren Wochen in die Zukunft.',
    examples: [
        'Was sind meine nächsten Termine?',
        'Zeige mir die Termine für heute',
        'Was steht diese Woche noch an?',
        'Wann ist mein nächstes Meeting?',
        'Liste alle Termine für morgen',
        'Zeige wichtige Termine der nächsten 2 Wochen',
        'Welche Deadlines stehen diese Woche an?'
    ]
};

const createEventCodex: ICodex = {
    type: 'action',
    summary: 'Neuen Termin erstellen',
    description: 'Erstellt einen neuen Termin - egal ob einmalig oder wiederkehrend. Sie können Teilnehmer einladen, Online-Meetings automatisch erstellen und Erinnerungen einrichten.',
    examples: [
        'Erstelle einen Termin "Team-Meeting" morgen um 10 Uhr',
        'Plane einen ganztägigen Urlaub vom 1. bis 15. August',
        'Erstelle einen wöchentlichen Jour-Fix jeden Montag um 9 Uhr',
        'Neues Online-Meeting am Freitag um 14 Uhr',
        'Trage Geburtstag von Max am 3. Mai ein',
        'Erstelle Termin mit automatischer Zoom-Einladung',
        'Plane monatliches Review jeweils am ersten Montag'
    ]
};

const updateEventCodex: ICodex = {
    type: 'action',
    summary: 'Termin ändern',
    description: 'Ändert einen bestehenden Termin. Bei Serienterminen kann gewählt werden, ob nur dieser oder alle zukünftigen Termine geändert werden sollen.',
    examples: [
        'Verschiebe das Meeting auf 15 Uhr',
        'Ändere den Ort zu "Konferenzraum A"',
        'Füge Thomas als Teilnehmer hinzu',
        'Mache aus dem Meeting ein Online-Meeting',
        'Verlängere den Termin um 30 Minuten'
    ]
};

const deleteEventCodex: ICodex = {
    type: 'action',
    summary: 'Termin löschen',
    description: 'Löscht einen oder mehrere Termine. Bietet Optionen zum Löschen von Einzelterminen oder ganzen Serien.',
    examples: [
        'Lösche den Termin morgen um 10 Uhr',
        'Entferne alle Termine dieser Serie',
        'Lösche das Meeting am Freitag',
        'Entferne alle abgesagten Termine'
    ]
};

const findEventsCodex: ICodex = {
    type: 'action',
    summary: 'Termine finden',
    description: 'Durchsucht den Kalender nach bestimmten Kriterien wie Titel, Teilnehmer, Ort oder Zeitraum. Unterstützt auch komplexe Suchanfragen.',
    examples: [
        'Finde alle Team-Meetings im Mai',
        'Suche Termine mit Peter',
        'Zeige alle Online-Meetings dieser Woche',
        'Finde Termine im Konferenzraum A',
        'Suche nach Urlaubseinträgen'
    ]
};

const respondToEventCodex: ICodex = {
    type: 'action',
    summary: 'Auf Einladung antworten',
    description: 'Beantwortet Termineinladungen mit Zu- oder Absage. Ermöglicht auch das Hinzufügen von Kommentaren oder alternativen Terminvorschlägen.',
    examples: [
        'Sage für das Meeting morgen zu',
        'Lehne den Termin am Freitag ab',
        'Antworte mit "Vielleicht" und schlage alternative Zeit vor',
        'Bestätige Teilnahme am Workshop'
    ]
};

const checkAvailabilityCodex: ICodex = {
    type: 'action',
    summary: 'Verfügbarkeit prüfen',
    description: 'Findet die perfekte Zeit für Ihr Meeting. Prüft die Verfügbarkeit aller Teilnehmer und Ressourcen und schlägt passende Termine vor.',
    examples: [
        'Wann sind alle Teammitglieder diese Woche verfügbar?',
        'Ist der Konferenzraum morgen um 14 Uhr frei?',
        'Zeige freie Zeiten für ein Meeting nächste Woche',
        'Wann haben Peter und Marie beide Zeit?',
        'Finde einen 2-Stunden-Slot diese Woche',
        'Wann ist der Meetingraum A für 10 Personen verfügbar?',
        'Zeige Verfügbarkeit des Teams zwischen 9 und 17 Uhr'
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
                name: 'Nächste Termine Anzeigen',
                value: 'nextEvents',
                description: 'Zeigt anstehende Termine',
                action: 'Show upcoming events',
                codex: nextEventsCodex
            },
            {
                name: 'Termin Erstellen',
                value: 'create',
                description: 'Erstellt einen neuen Termin',
                action: 'Create a new event',
                codex: createEventCodex
            },
            {
                name: 'Termin Ändern',
                value: 'update',
                description: 'Ändert einen bestehenden Termin',
                action: 'Update an existing event',
                codex: updateEventCodex
            },
            {
                name: 'Termin Löschen',
                value: 'delete',
                description: 'Löscht einen Termin',
                action: 'Delete an event',
                codex: deleteEventCodex
            },
            {
                name: 'Termine Suchen',
                value: 'find',
                description: 'Sucht nach bestimmten Terminen',
                action: 'Find events',
                codex: findEventsCodex
            },
            {
                name: 'Auf Einladung Antworten',
                value: 'respond',
                description: 'Beantwortet eine Termineinladung',
                action: 'Respond to invitation',
                codex: respondToEventCodex
            },
            {
                name: 'Verfügbarkeit Prüfen',
                value: 'checkAvailability',
                description: 'Prüft Verfügbarkeit von Teilnehmern/Ressourcen',
                action: 'Check availability',
                codex: checkAvailabilityCodex
            }
        ],
        default: 'nextEvents',
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
        description: 'Select the calendar to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
