import { INodeProperties } from 'n8n-workflow';

// Ressource: Kalender
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
                name: 'Get Many',
                value: 'getAll',
                description: 'Alle verfügbaren Kalender anzeigen',
                action: 'Show all available calendars',
            },
            {
                name: 'Erstellen',
                value: 'create',
                description: 'Einen neuen Kalender erstellen',
                action: 'Create a new calendar',
            },
            {
                name: 'Löschen',
                value: 'delete',
                description: 'Einen Kalender löschen',
                action: 'Delete a calendar',
            },
        ],
        default: 'getAll',
    },
];

export const calendarFields: INodeProperties[] = [
    // Kalender-Name für Kalender löschen
    {
        displayName: 'Kalender Name Oder Name or ID',
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
        description: 'Wählen Sie aus der Liste oder geben Sie eine ID mit einer <a href="https://docs.n8n.io/code/expressions/">Expression</a> an. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
    
    // Kalender-Name für Erstellung
    {
        displayName: 'Kalender Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['calendar'],
                operation: ['create'],
            },
        },
        description: 'Name des neuen Kalenders',
    },
    
    // Kalender-Einstellungen
    {
        displayName: 'Kalender Einstellungen',
        name: 'calendarSettings',
        type: 'collection',
        placeholder: 'Einstellungen hinzufügen',
        default: {},
        displayOptions: {
            show: {
                resource: ['calendar'],
                operation: ['create'],
            },
        },
        options: [
            {
                displayName: 'Farbe',
                name: 'color',
                type: 'color',
                default: '#0082C9',
                description: 'Farbe des Kalenders in der Benutzeroberfläche',
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