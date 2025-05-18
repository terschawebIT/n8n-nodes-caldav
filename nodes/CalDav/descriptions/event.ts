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
                description: 'Create a new calendar event',
                action: 'Create a new event',
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete an existing calendar event',
                action: 'Delete an event',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get details of a specific calendar event',
                action: 'Get a single event',
            },
            {
                name: 'Get Many',
                value: 'getMany',
                description: 'Get a list of calendar events',
                action: 'Get multiple events',
            },
            {
                name: 'Search',
                value: 'search',
                description: 'Search for calendar events by title or description',
                action: 'Search for events',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update an existing calendar event',
                action: 'Update an event',
            },
        ],
        default: 'getMany',
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
        description: 'Select the calendar to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
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
            },
            {
                displayName: 'Location',
                name: 'location',
                type: 'string',
                default: '',
                placeholder: 'Conference Room A or https://meet.example.com',
                description: 'Physical location or virtual meeting link for the event',
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
