import { INodeProperties } from 'n8n-workflow';

export const calendarOperations: INodeProperties[] = [
    {
        displayName: 'Aktion',
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
                name: 'Get Many',
                value: 'getAll',
                description: 'Get a list of all available Nextcloud calendars',
                action: 'Get all calendars',
            },
            {
                name: 'Create Calendar',
                value: 'create',
                description: 'Create a new Nextcloud calendar',
                action: 'Create a new calendar',
            },
            {
                name: 'Delete Calendar',
                value: 'delete',
                description: 'Delete an existing Nextcloud calendar',
                action: 'Delete a calendar',
            },
        ],
        default: 'getAll',
    },
];

export const calendarFields: INodeProperties[] = [
    {
        displayName: 'Calendar Name or ID',
        name: 'calendarName',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getCalendars',
        },
        displayOptions: {
            show: {
                resource: ['calendar'],
                operation: ['delete'],
            },
        },
        default: '',
        required: true,
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    },
    {
        displayName: 'Kalendername',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['calendar'],
                operation: ['create'],
            },
        },
        default: '',
        placeholder: 'Mein neuer Kalender',
        description: 'Name des neuen Nextcloud-Kalenders',
    },
    {
        displayName: 'Kalender Einstellungen',
        name: 'calendarSettings',
        type: 'collection',
        placeholder: 'Einstellung hinzufügen',
        default: {},
        displayOptions: {
            show: {
                resource: ['calendar'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Zeitzone',
                name: 'timezone',
                type: 'string',
                default: 'Europe/Berlin',
                description: 'Zeitzone für den Kalender (z.B. Europe/Berlin).',
            },
            {
                displayName: 'Farbe',
                name: 'color',
                type: 'color',
                default: '#0082C9',
                description: 'Farbe des Kalenders in der Nextcloud-Oberfläche',
            },
            {
                displayName: 'Beschreibung',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Beschreibung des Kalenders',
            },
            {
                displayName: 'Sichtbarkeit',
                name: 'visibility',
                type: 'options',
                options: [
                    {
                        name: 'Privat',
                        value: 'private',
                        description: 'Nur für Sie sichtbar',
                    },
                    {
                        name: 'Öffentlich',
                        value: 'public',
                        description: 'Für alle sichtbar',
                    },
                ],
                default: 'private',
                description: 'Sichtbarkeit des Kalenders für andere Benutzer',
            },
        ],
    },
];
