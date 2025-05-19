import { INodeProperties } from 'n8n-workflow';

// Event-Operationen
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
                name: 'Get Many',
                value: 'getAll',
                description: 'Sucht nach Terminen in einem Zeitraum',
                action: 'Find events in a time range',
            },
            {
                name: 'Nächste Termine Anzeigen',
                value: 'nextEvents',
                description: 'Zeigt anstehende Termine',
                action: 'Show upcoming events',
            },
            {
                name: 'Termin Ändern',
                value: 'update',
                description: 'Ändert einen bestehenden Termin',
                action: 'Update an existing event',
            },
            {
                name: 'Termin Anzeigen',
                value: 'get',
                description: 'Einen Termin anzeigen',
                action: 'Display an event',
            },
            {
                name: 'Termin Erstellen',
                value: 'create',
                description: 'Erstellt einen neuen Termin',
                action: 'Create a new event',
            },
            {
                name: 'Termin Löschen',
                value: 'delete',
                description: 'Löscht einen Termin',
                action: 'Delete an event',
            },
        ],
        default: 'nextEvents',
    },
];

export const eventFields: INodeProperties[] = [
    // Kalender-Name für alle Event-Operationen
    {
        displayName: 'Kalender Name Oder Name or ID',
        name: 'calendarName',
        type: 'string',
        typeOptions: {
            loadOptionsMethod: 'getCalendars',
            loadOptionsDependsOn: [],
            loadOptionsGlobally: true,
            modifyOptionProperties: {
                ['value']: {
                    type: 'string',
                    canBeExpression: true,
                    AIParametrizable: true
                }
            }
        },
        displayOptions: {
            show: {
                resource: ['event'],
            },
        },
        default: '',
        required: true,
        description: 'Wählen Sie aus der Liste oder geben Sie eine ID mit einer <a href="https://docs.n8n.io/code/expressions/">Expression</a> an. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
    
    // Event-ID für Operationen, die eine Event-ID benötigen
    {
        displayName: 'Termin ID',
        name: 'eventId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['delete', 'get', 'update'],
            },
        },
        description: 'ID des Termins',
    },
    
    // Event-Felder für Termin erstellen
    {
        displayName: 'Titel',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['create'],
            },
        },
        description: 'Titel des Termins',
    },
    {
        displayName: 'Start',
        name: 'start',
        type: 'dateTime',
        required: true,
        default: '={{ $now }}',
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['create'],
            },
        },
        description: 'Startzeit des Termins',
    },
    {
        displayName: 'Ende',
        name: 'end',
        type: 'dateTime',
        required: true,
        default: '={{ $now.plus({ hour: 1 }).toISO() }}',
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['create'],
            },
        },
        description: 'Endzeit des Termins',
    },
    
    // Zeitraum für Termine suchen
    {
        displayName: 'Start',
        name: 'start',
        type: 'dateTime',
        required: true,
        default: '={{ $now }}',
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['getAll'],
            },
        },
        description: 'Startzeit für die Terminsuche',
    },
    {
        displayName: 'Ende',
        name: 'end',
        type: 'dateTime',
        required: true,
        default: '={{ $now.plus({ month: 1 }).toISO() }}',
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['getAll'],
            },
        },
        description: 'Endzeit für die Terminsuche',
    },
    
    // Zusätzliche Felder für Termin erstellen
    {
        displayName: 'Zusätzliche Felder',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Feld hinzufügen',
        default: {},
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Beschreibung',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Beschreibung des Termins',
            },
            {
                displayName: 'Ort',
                name: 'location',
                type: 'string',
                default: '',
                description: 'Ort des Termins',
            },
            {
                displayName: 'Teilnehmer Hinzufügen',
                name: 'addAttendees',
                type: 'boolean',
                default: false,
                description: 'Whether to add attendees to the event',
            },
            {
                displayName: 'Teilnehmer',
                name: 'attendees',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        addAttendees: [true],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Teilnehmer',
                        name: 'attendeeFields',
                        values: [
                            {
                                displayName: 'E-Mail',
                                name: 'email',
                                type: 'string',
                                placeholder: 'name@email.com',
                                required: true,
                                default: '',
                            },
                            {
                                displayName: 'Anzeigename',
                                name: 'displayName',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'RSVP',
                                name: 'rsvp',
                                type: 'boolean',
                                default: true,
                                description: 'Whether a response is expected from the attendee',
                            },
                            {
                                displayName: 'Rolle',
                                name: 'role',
                                type: 'options',
                                options: [
                                    {
                                        name: 'Erforderlicher Teilnehmer',
                                        value: 'REQ-PARTICIPANT',
                                    },
                                    {
                                        name: 'Optionaler Teilnehmer',
                                        value: 'OPT-PARTICIPANT',
                                    },
                                    {
                                        name: 'Organisator',
                                        value: 'CHAIR',
                                    },
                                ],
                                default: 'REQ-PARTICIPANT',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    
    // Felder zum Aktualisieren eines Termins
    {
        displayName: 'Update Fields',
        name: 'updateFields',
        type: 'collection',
        placeholder: 'Feld aktualisieren',
        default: {},
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['update'],
            },
        },
        options: [
            {
                displayName: 'Beschreibung',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Neue Beschreibung des Termins',
            },
            {
                displayName: 'Ende',
                name: 'end',
                type: 'dateTime',
                default: '',
                description: 'Neue Endzeit des Termins',
            },
            {
                displayName: 'Ort',
                name: 'location',
                type: 'string',
                default: '',
                description: 'Neuer Ort des Termins',
            },
            {
                displayName: 'Start',
                name: 'start',
                type: 'dateTime',
                default: '',
                description: 'Neue Startzeit des Termins',
            },
            {
                displayName: 'Titel',
                name: 'title',
                type: 'string',
                default: '',
                description: 'Neuer Titel des Termins',
            },
        ],
    },
    
    // Nextcloud-spezifische Einstellungen
    {
        displayName: 'Nextcloud Einstellungen',
        name: 'nextcloudSettings',
        type: 'collection',
        placeholder: 'Nextcloud-Einstellungen hinzufügen',
        default: {},
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['create', 'update']
            },
        },
        options: [
            {
                displayName: 'Alarm-Typ Erzwingen',
                name: 'forceEventAlarmType',
                type: 'options',
                options: [
                    {
                        name: 'E-Mail',
                        value: 'EMAIL',
                    },
                    {
                        name: 'Anzeige',
                        value: 'DISPLAY',
                    }
                ],
                default: 'DISPLAY',
                description: 'Erzwingt einen bestimmten Alarm-Typ für Termine',
                displayOptions: {
                    show: {
                        '/resource': ['event'],
                        enableNotifications: [true],
                    },
                },
            },
            {
                displayName: 'Benachrichtigungen Aktivieren',
                name: 'enableNotifications',
                type: 'boolean',
                default: true,
                description: 'Whether to enable notifications for events',
            },
            {
                displayName: 'Einladungen Senden',
                name: 'sendInvitations',
                type: 'boolean',
                default: true,
                description: 'Whether to send invitations to participants',
                displayOptions: {
                    show: {
                        '/resource': ['event'],
                        '/operation': ['create', 'update']
                    },
                },
            },
            {
                displayName: 'Export Ausblenden',
                name: 'hideEventExport',
                type: 'boolean',
                default: false,
                description: 'Whether to hide the export buttons in the user interface',
            },
            {
                displayName: 'Push-Benachrichtigungen Aktivieren',
                name: 'enablePushNotifications',
                type: 'boolean',
                default: true,
                description: 'Whether to enable push notifications for events',
            },
        ],
    },
    
    // Zeitraum für nächste Termine
    {
        displayName: 'Max. Anzahl Termine',
        name: 'maxEvents',
        type: 'number',
        default: 10,
        displayOptions: {
            show: {
                resource: ['event'],
                operation: ['nextEvents'],
            },
        },
        description: 'Maximale Anzahl der zurückgegebenen Termine',
    },
]; 