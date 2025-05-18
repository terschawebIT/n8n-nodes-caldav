import { INodeProperties } from 'n8n-workflow';

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
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete an existing calendar from the CalDAV server',
                action: 'Delete a calendar',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get details of a specific calendar',
                action: 'Get a single calendar',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                description: 'Get a list of all available calendars',
                action: 'Get multiple calendars',
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
        description: 'Select the calendar to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
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
            },
        ],
    },
];
