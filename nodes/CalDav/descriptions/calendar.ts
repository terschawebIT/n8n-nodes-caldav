import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

// Definiere die Codex-Typen für die Kalender-Operationen
const listCalendarsCodex: ICodex = {
    type: 'action',
    summary: 'Kalender anzeigen',
    description: 'Zeigt eine Übersicht aller verfügbaren Kalender mit ihren Eigenschaften wie Name, Farbe, Zeitzone und Freigaben.',
    examples: [
        'Zeige alle meine Kalender',
        'Welche Kalender sind verfügbar?',
        'Liste die Team-Kalender auf',
        'Zeige geteilte Kalender',
        'Welche Kalender kann ich bearbeiten?'
    ]
};

const createCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender erstellen',
    description: 'Erstellt einen neuen Kalender mit anpassbaren Einstellungen für Name, Farbe, Zeitzone und Zugriffsrechte.',
    examples: [
        'Erstelle einen neuen Kalender "Projekt Alpha"',
        'Lege einen Team-Kalender an',
        'Erstelle einen privaten Kalender',
        'Neuer Kalender mit Zeitzone Europe/Berlin',
        'Erstelle einen geteilten Kalender für das Marketing-Team'
    ]
};

const configureCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender konfigurieren',
    description: 'Passt die Einstellungen eines bestehenden Kalenders an, einschließlich Name, Farbe, Zeitzone, Benachrichtigungen und Freigaben.',
    examples: [
        'Ändere die Farbe des Team-Kalenders auf Blau',
        'Stelle die Zeitzone auf Europe/Berlin',
        'Aktiviere Benachrichtigungen für neue Termine',
        'Passe die Standardansicht an',
        'Ändere den Kalendernamen'
    ]
};

const shareCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender freigeben',
    description: 'Verwaltet die Freigaben und Berechtigungen für einen Kalender. Ermöglicht das Teilen mit einzelnen Personen oder Gruppen.',
    examples: [
        'Teile den Kalender mit dem Team',
        'Gib Sarah Zugriff auf den Projektkalender',
        'Mache den Kalender öffentlich lesbar',
        'Entferne die Freigabe für Max',
        'Ändere Toms Rechte auf "nur lesen"'
    ]
};

const subscribeCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender abonnieren',
    description: 'Fügt einen externen Kalender hinzu, wie Feiertage, Teamkalender oder öffentliche Veranstaltungen.',
    examples: [
        'Abonniere den Feiertagskalender',
        'Füge den Team-Kalender hinzu',
        'Importiere den Urlaubskalender',
        'Verbinde mit einem öffentlichen Kalender',
        'Abonniere den Geburstagskalender'
    ]
};

const deleteCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender löschen',
    description: 'Entfernt einen Kalender und alle seine Termine. Bei geteilten Kalendern werden auch alle Freigaben aufgehoben.',
    examples: [
        'Lösche den alten Projektkalender',
        'Entferne den nicht mehr benötigten Kalender',
        'Lösche meinen Test-Kalender',
        'Entferne den abgelaufenen Kalender',
        'Lösche den privaten Kalender'
    ]
};

export const calendarOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['calendar'],
            },
        },
        options: [
            {
                name: 'Kalender anzeigen',
                value: 'list',
                description: 'Zeigt verfügbare Kalender',
                action: 'List calendars',
                codex: listCalendarsCodex
            },
            {
                name: 'Kalender erstellen',
                value: 'create',
                description: 'Erstellt einen neuen Kalender',
                action: 'Create calendar',
                codex: createCalendarCodex
            },
            {
                name: 'Kalender konfigurieren',
                value: 'configure',
                description: 'Passt Kalendereinstellungen an',
                action: 'Configure calendar',
                codex: configureCalendarCodex
            },
            {
                name: 'Kalender freigeben',
                value: 'share',
                description: 'Verwaltet Kalenderfreigaben',
                action: 'Share calendar',
                codex: shareCalendarCodex
            },
            {
                name: 'Kalender abonnieren',
                value: 'subscribe',
                description: 'Fügt externen Kalender hinzu',
                action: 'Subscribe to calendar',
                codex: subscribeCalendarCodex
            },
            {
                name: 'Kalender löschen',
                value: 'delete',
                description: 'Entfernt einen Kalender',
                action: 'Delete calendar',
                codex: deleteCalendarCodex
            }
        ],
        default: 'list',
    },
];

export const calendarFields: INodeProperties[] = [
    {
        displayName: 'New Calendar Name',
        name: 'calendarName',
        type: 'string',
        displayOptions: {
            show: {
                resource: [
                    'calendar'
                ],
                operation: [
                    'create'
                ],
            },
        },
        default: '',
        description: 'Name for the new calendar to be created on the CalDAV server',
        placeholder: 'My New Calendar',
        required: true,
        codex: {
            type: 'string',
            summary: 'The name of the new calendar',
            examples: ['Team Calendar', 'Project Deadlines', 'Holidays 2024'],
        },
    },
    {
        displayName: 'Calendar Name or ID',
        name: 'name',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getCalendars',
        },
        displayOptions: {
            show: {
                resource: [
                    'calendar'
                ],
                operation: [
                    'delete',
                    'get'
                ],
            },
        },
        default: '',
        required: true,
        description: 'Select the calendar to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
        codex: {
            type: 'string',
            summary: 'The name or ID of the calendar to operate on',
            examples: ['Work Calendar', 'personal-calendar', 'team-events'],
        },
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        displayOptions: {
            show: {
                resource: [
                    'calendar'
                ],
                operation: [
                    'create'
                ],
            },
        },
        default: {},
        options: [
            {
                displayName: 'Timezone',
                name: 'timezone',
                type: 'string',
                default: 'UTC',
                description: 'The timezone for the calendar (e.g. Europe/Berlin, America/New_York)',
                placeholder: 'UTC',
                codex: {
                    type: 'string',
                    summary: 'The timezone for the calendar',
                    examples: ['Europe/Berlin', 'America/New_York', 'Asia/Tokyo'],
                },
            },
        ],
    },
];
