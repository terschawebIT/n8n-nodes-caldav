import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

// Definiere die Codex-Typen für die Kalender-Operationen
const createCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Erstelle einen neuen Kalender',
    description: 'Erstellt einen neuen Kalender auf dem CalDAV-Server mit Namen und optionaler Zeitzone',
    examples: [
        'Erstelle einen Arbeitskalender',
        'Lege einen neuen Kalender "Urlaub 2024" an',
        'Erstelle einen Kalender für das Team mit Zeitzone Europe/Berlin'
    ]
};

const deleteCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Lösche einen Kalender',
    description: 'Entfernt einen Kalender und alle darin enthaltenen Termine dauerhaft vom Server',
    examples: [
        'Lösche den Kalender "Alte Meetings"',
        'Entferne den Projektkalender 2023'
    ]
};

const getCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Hole Kalender-Details',
    description: 'Ruft detaillierte Informationen über einen bestimmten Kalender ab, einschließlich Name, Zeitzone und Einstellungen',
    examples: [
        'Zeige mir die Details des Team-Kalenders',
        'Welche Einstellungen hat der Kalender "Meetings"?'
    ]
};

const getAllCalendarsCodex: ICodex = {
    type: 'action',
    summary: 'Liste alle verfügbaren Kalender',
    description: 'Zeigt eine Liste aller zugänglichen Kalender mit ihren Namen und Eigenschaften',
    examples: [
        'Zeige alle meine Kalender',
        'Liste verfügbare Kalender auf',
        'Welche Kalender habe ich?'
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
                name: 'Create',
                value: 'create',
                description: 'Erstelle einen neuen Kalender',
                action: 'Create a calendar',
                codex: createCalendarCodex
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Lösche einen Kalender',
                action: 'Delete a calendar',
                codex: deleteCalendarCodex
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Hole Kalender-Details',
                action: 'Get a calendar',
                codex: getCalendarCodex
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Liste alle Kalender auf',
                action: 'Get many calendars',
                codex: getAllCalendarsCodex
            },
        ],
        default: 'create',
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
