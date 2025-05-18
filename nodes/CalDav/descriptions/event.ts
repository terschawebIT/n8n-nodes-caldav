import { INodeProperties } from 'n8n-workflow';

export const eventOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                action: 'Create a new event',
            },
            {
                name: 'Delete',
                value: 'delete',
                action: 'Delete an event',
            },
            {
                name: 'Get',
                value: 'get',
                action: 'Get a single event',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                action: 'Get multiple events',
            },
            {
                name: 'Search',
                value: 'search',
                action: 'Search for events',
            },
            {
                name: 'Update',
                value: 'update',
                action: 'Update an event',
            },
        ],
        default: 'getMany',
    },
];

export const eventFields: INodeProperties[] = [
    {
        displayName: 'Calendar',
        name: 'calendar',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getCalendars',
        },
        required: true,
        default: '',
        description: 'The calendar to operate on',
        displayOptions: {
            show: {
                resource: [
                    'event'
                ],
            },
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
        description: 'The title of the event',
        required: true,
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
        description: 'The ID of the event',
        required: true,
    },
    {
        displayName: 'Start',
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
        description: 'The start time of the event',
        required: true,
    },
    {
        displayName: 'End',
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
        description: 'The end time of the event',
        required: true,
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
                description: 'The description of the event',
            },
            {
                displayName: 'Location',
                name: 'location',
                type: 'string',
                default: '',
                description: 'The location of the event',
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
