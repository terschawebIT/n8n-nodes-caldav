import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

// Definiere die Codex-Typen für die Operationen
const createCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Create a new calendar on the CalDAV server',
    description: 'Creates a new calendar with specified name and timezone',
    examples: ['Create a work calendar', 'Create a personal calendar with Europe/Berlin timezone']
};

const deleteCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Delete an existing calendar from the CalDAV server',
    description: 'Permanently removes a calendar and all its events',
    examples: ['Delete the calendar named "Old Meetings"']
};

const getCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Retrieve calendar information from the CalDAV server',
    description: 'Gets details about a specific calendar including its properties',
    examples: ['Get details of the calendar named "Team Events"']
};

const getAllCalendarsCodex: ICodex = {
    type: 'action',
    summary: 'Retrieve multiple calendars from the CalDAV server',
    description: 'Gets a list of all available calendars and their properties',
    examples: ['Get all calendars', 'List all available calendars']
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
                description: 'Create a new calendar',
                action: 'Create a calendar',
                codex: createCalendarCodex
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete a calendar',
                action: 'Delete a calendar',
                codex: deleteCalendarCodex
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get a calendar',
                action: 'Get a calendar',
                codex: getCalendarCodex
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get many calendars',
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
