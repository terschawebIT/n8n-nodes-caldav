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
                name: 'Kalender Erstellen',
                value: 'create',
                description: 'Einen neuen Nextcloud-Kalender erstellen',
                action: 'Einen neuen kalender erstellen',
            },
            {
                name: 'Kalender Löschen',
                value: 'delete',
                description: 'Einen bestehenden Nextcloud-Kalender löschen',
                action: 'Einen kalender l schen',
            },
            {
                name: 'Get Many',
                value: 'getAll',
                description: 'Liste aller verfügbaren Nextcloud-Kalender abrufen',
                action: 'Alle kalender abrufen',
            },
        ],
        default: 'create',
    },
];

export const calendarFields: INodeProperties[] = [
    {
        displayName: 'Kalendername',
        name: 'name',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['calendar'],
                operation: ['create', 'delete'],
            },
        },
        default: '',
        description: 'Name des Nextcloud-Kalenders',
    },
    {
        displayName: 'Zusätzliche Felder',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Feld hinzufügen',
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
        ],
    },
];
