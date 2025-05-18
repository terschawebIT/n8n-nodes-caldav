import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

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
                name: 'Create',
                value: 'create',
                description: 'Create a new event',
                action: 'Create an event',
                codex: {
                    type: 'action',
                    summary: 'Create a new calendar event',
                    description: 'Creates a new event with title, start time, end time, and optional description',
                    examples: ['Create a meeting from 2024-05-01T10:00:00Z to 2024-05-01T11:00:00Z', 'Create a birthday event with description']
                }
            },
            {
                name: 'Delete',
                value: 'delete',
                description: 'Delete an event',
                action: 'Delete an event',
                codex: {
                    type: 'action',
                    summary: 'Delete an existing calendar event',
                    description: 'Removes a specific event from the calendar',
                    examples: ['Delete the event with ID "abc123"']
                }
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get an event',
                action: 'Get an event',
                codex: {
                    type: 'action',
                    summary: 'Retrieve a specific calendar event',
                    description: 'Gets details about a specific event including title, time, and description',
                    examples: ['Get details of the event titled "Quarterly Review"']
                }
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Get many events',
                action: 'Get many events',
                codex: {
                    type: 'action',
                    summary: 'Retrieve multiple calendar events',
                    description: 'Gets a list of events within a specified time range',
                    examples: ['Get all events for next week', 'List events between two dates']
                }
            },
            {
                name: 'Search',
                value: 'search',
                description: 'Search for calendar events by title or description',
                action: 'Search for events',
                codex: {
                    type: 'action',
                    summary: 'Search events',
                    description: 'Searches for events in the calendar matching the search term.',
                },
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update an event',
                action: 'Update an event',
                codex: {
                    type: 'action',
                    summary: 'Update an existing calendar event',
                    description: 'Modifies event details like title, time, or description',
                    examples: ['Update the meeting time to 3pm', 'Change event location to "Conference Room B"']
                }
            },
        ],
        default: 'create',
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
        description: 'Select the calendar to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
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
