import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

export const calendarOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: [
                    'calendar'
                ],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Create a new calendar on the CalDAV server',
                action: 'Create a new calendar',
                codex: {
                    type: 'action',
                    summary: 'Create a new calendar',
                    description: 'Creates a new calendar on the CalDAV server with the specified name and optional timezone.',
                },
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete an existing calendar from the CalDAV server',
                action: 'Delete a calendar',
                codex: {
                    type: 'action',
                    summary: 'Delete a calendar',
                    description: 'Deletes an existing calendar from the CalDAV server.',
                },
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get details of a specific calendar',
                action: 'Get a single calendar',
                codex: {
                    type: 'action',
                    summary: 'Get a calendar',
                    description: 'Retrieves details of a specific calendar from the CalDAV server.',
                },
            },
            {
                name: 'Get Many',
                value: 'getMany',
                description: 'Get a list of all available calendars',
                action: 'Get multiple calendars',
                codex: {
                    type: 'action',
                    summary: 'Get all calendars',
                    description: 'Retrieves a list of all available calendars from the CalDAV server.',
                },
            },
        ],
        default: 'getMany',
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
