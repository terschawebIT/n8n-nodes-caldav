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
                action: 'Create a new calendar',
            },
            {
                name: 'Delete',
                value: 'delete',
                action: 'Delete a calendar',
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a single calendar',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                action: 'Get multiple calendars',
            },
        ],
        default: 'getMany',
    },
];

export const calendarFields: INodeProperties[] = [
    {
        displayName: 'Calendar Name',
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
        description: 'The name of the calendar to create',
        required: true,
    },
    {
        displayName: 'Calendar',
        name: 'calendar',
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
        description: 'The calendar to operate on',
        required: true,
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
                description: 'The timezone of the calendar',
            },
        ],
    },
];
