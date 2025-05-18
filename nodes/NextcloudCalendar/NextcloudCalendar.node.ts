/* eslint-disable n8n-nodes-base/node-class-description-credentials-name-unsuffixed */
/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
/* eslint-disable n8n-nodes-base/node-class-description-outputs-wrong */

import {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeExecutionData,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription,
    IDataObject,
    NodeOperationError,
    NodeConnectionType,
} from 'n8n-workflow';

// Importe der Aktionen und Hilfsfunktionen
import * as calendarActions from './actions/calendar';
import * as eventActions from './actions/event';
import { parseNextcloudResponse } from './helpers/nextcloud';
import { ICalendarCreate } from './interfaces/calendar';
import { IEventCreate, IEventUpdate } from './interfaces/event';

export class NextcloudCalendar implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Nextcloud Calendar',
        name: 'nextcloudCalendar',
        icon: 'file:nextcloud-calendar.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Verwalten Sie Ihre Kalender und Termine mit Nextcloud CalDAV',
        defaults: {
            name: 'Nextcloud Calendar',
        },
        inputs: [{ type: NodeConnectionType.Main }],
        outputs: [{ type: NodeConnectionType.Main }],
        credentials: [
            {
                name: 'nextcloudCalendarApi',
                required: true,
                displayName: 'Nextcloud Calendar API',
            },
        ],
        usableAsTool: true,
        properties: [
            // Ressource: Kalender oder Termin
            {
                displayName: 'Ressource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Kalender',
                        value: 'calendar',
                        description: 'Kalender erstellen und verwalten'
                    },
                    {
                        name: 'Termin',
                        value: 'event',
                        description: 'Termine planen und organisieren'
                    }
                ],
                default: 'calendar',
                required: true,
            },
            
            // Kalender-Operationen
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
            
            // Event-Operationen
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
                        name: 'Nächste Termine Anzeigen',
                        value: 'nextEvents',
                        description: 'Zeigt anstehende Termine',
                        action: 'Show upcoming events',
                    },
                    {
                        name: 'Termin Ändern',
                        value: 'update',
                        description: 'Ändert einen bestehenden Termin',
                        action: 'Update an existing event',
                    },
                    {
                        name: 'Termin Anzeigen',
                        value: 'get',
                        description: 'Einen Termin anzeigen',
                        action: 'Display an event',
                    },
                    {
                        name: 'Termin Erstellen',
                        value: 'create',
                        description: 'Erstellt einen neuen Termin',
                        action: 'Create a new event',
                    },
                    {
                        name: 'Termin Löschen',
                        value: 'delete',
                        description: 'Löscht einen Termin',
                        action: 'Delete an event',
                    },
                    {
                        name: 'Get Many',
                        value: 'getAll',
                        description: 'Sucht nach Terminen in einem Zeitraum',
                        action: 'Find events in a time range',
                    },
                ],
                default: 'nextEvents',
            },
            
            // Kalender-Name für alle Event-Operationen und Kalender löschen
            {
                displayName: 'Kalender Name Oder Name or ID',
                name: 'calendarName',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getCalendars',
                },
                displayOptions: {
                    show: {
                        resource: ['event'],
                    },
                },
                default: '',
                required: true,
                description: 'Wählen Sie aus der Liste oder geben Sie eine ID mit einer <a href="https://docs.n8n.io/code/expressions/">Expression</a> an. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            },
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
            
            // Event-ID für Operationen, die eine Event-ID benötigen
            {
                displayName: 'Termin ID',
                name: 'eventId',
                type: 'string',
                required: true,
                default: '',
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['delete', 'get', 'update'],
                    },
                },
                description: 'ID des Termins',
            },
            
            // Event-Felder für Termin erstellen
            {
                displayName: 'Titel',
                name: 'title',
                type: 'string',
                required: true,
                default: '',
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['create'],
                    },
                },
                description: 'Titel des Termins',
            },
            {
                displayName: 'Start',
                name: 'start',
                type: 'dateTime',
                required: true,
                default: '={{ $now }}',
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['create'],
                    },
                },
                description: 'Startzeit des Termins',
            },
            {
                displayName: 'Ende',
                name: 'end',
                type: 'dateTime',
                required: true,
                default: '={{ $now.plus({ hour: 1 }).toISO() }}',
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['create'],
                    },
                },
                description: 'Endzeit des Termins',
            },
            
            // Zeitraum für Termine suchen
            {
                displayName: 'Start',
                name: 'start',
                type: 'dateTime',
                required: true,
                default: '={{ $now }}',
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['getAll'],
                    },
                },
                description: 'Startzeit für die Terminsuche',
            },
            {
                displayName: 'Ende',
                name: 'end',
                type: 'dateTime',
                required: true,
                default: '={{ $now.plus({ month: 1 }).toISO() }}',
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['getAll'],
                    },
                },
                description: 'Endzeit für die Terminsuche',
            },
            
            // Zusätzliche Felder für Termin erstellen
            {
                displayName: 'Zusätzliche Felder',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Feld hinzufügen',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['create'],
                    },
                },
                options: [
                    {
                        displayName: 'Beschreibung',
                        name: 'description',
                        type: 'string',
                        default: '',
                        description: 'Beschreibung des Termins',
                    },
                    {
                        displayName: 'Ort',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Ort des Termins',
                    },
                    {
                        displayName: 'Teilnehmer Hinzufügen',
                        name: 'addAttendees',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to add attendees to the event',
                    },
                    {
                        displayName: 'Teilnehmer',
                        name: 'attendees',
                        type: 'fixedCollection',
                        typeOptions: {
                            multipleValues: true,
                        },
                        displayOptions: {
                            show: {
                                addAttendees: [true],
                            },
                        },
                        default: {},
                        options: [
                            {
                                displayName: 'Teilnehmer',
                                name: 'attendeeFields',
                                values: [
                                    {
                                        displayName: 'E-Mail',
                                        name: 'email',
                                        type: 'string',
                                        placeholder: 'name@email.com',
                                        required: true,
                                        default: '',
                                    },
                                    {
                                        displayName: 'Anzeigename',
                                        name: 'displayName',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'RSVP',
                                        name: 'rsvp',
                                        type: 'boolean',
                                        default: true,
                                        description: 'Whether a response is expected from the attendee',
                                    },
                                    {
                                        displayName: 'Rolle',
                                        name: 'role',
                                        type: 'options',
                                        options: [
                                            {
                                                name: 'Erforderlicher Teilnehmer',
                                                value: 'REQ-PARTICIPANT',
                                            },
                                            {
                                                name: 'Optionaler Teilnehmer',
                                                value: 'OPT-PARTICIPANT',
                                            },
                                            {
                                                name: 'Organisator',
                                                value: 'CHAIR',
                                            },
                                        ],
                                        default: 'REQ-PARTICIPANT',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            
            // Felder zum Aktualisieren eines Termins
            {
                displayName: 'Update Fields',
                name: 'updateFields',
                type: 'collection',
                placeholder: 'Feld aktualisieren',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['update'],
                    },
                },
                options: [
                    {
                        displayName: 'Titel',
                        name: 'title',
                        type: 'string',
                        default: '',
                        description: 'Neuer Titel des Termins',
                    },
                    {
                        displayName: 'Start',
                        name: 'start',
                        type: 'dateTime',
                        default: '',
                        description: 'Neue Startzeit des Termins',
                    },
                    {
                        displayName: 'Ende',
                        name: 'end',
                        type: 'dateTime',
                        default: '',
                        description: 'Neue Endzeit des Termins',
                    },
                    {
                        displayName: 'Beschreibung',
                        name: 'description',
                        type: 'string',
                        default: '',
                        description: 'Neue Beschreibung des Termins',
                    },
                    {
                        displayName: 'Ort',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Neuer Ort des Termins',
                    },
                ],
            },
            
            // Nextcloud-spezifische Einstellungen
            {
                displayName: 'Nextcloud Einstellungen',
                name: 'nextcloudSettings',
                type: 'collection',
                placeholder: 'Nextcloud-Einstellungen hinzufügen',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['event'],
                        operation: ['create', 'update']
                    },
                },
                options: [
                    {
                        displayName: 'Alarm-Typ Erzwingen',
                        name: 'forceEventAlarmType',
                        type: 'options',
                        options: [
                            {
                                name: 'E-Mail',
                                value: 'EMAIL',
                            },
                            {
                                name: 'Anzeige',
                                value: 'DISPLAY',
                            }
                        ],
                        default: 'DISPLAY',
                        description: 'Erzwingt einen bestimmten Alarm-Typ für Termine',
                        displayOptions: {
                            show: {
                                '/resource': ['event'],
                                enableNotifications: [true],
                            },
                        },
                    },
                    {
                        displayName: 'Benachrichtigungen Aktivieren',
                        name: 'enableNotifications',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to enable notifications for events',
                    },
                    {
                        displayName: 'Einladungen Senden',
                        name: 'sendInvitations',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to send invitations to participants',
                        displayOptions: {
                            show: {
                                '/resource': ['event'],
                                '/operation': ['create', 'update']
                            },
                        },
                    },
                    {
                        displayName: 'Export Ausblenden',
                        name: 'hideEventExport',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to hide the export buttons in the user interface',
                    },
                    {
                        displayName: 'Push-Benachrichtigungen Aktivieren',
                        name: 'enablePushNotifications',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to enable push notifications for events',
                    },
                ],
            },
        ],
    };

    methods = {
        loadOptions: {
            async getCalendars(
                this: ILoadOptionsFunctions,
            ): Promise<INodePropertyOptions[]> {
                const calendars = await calendarActions.getCalendars(this);
                return calendars.map((calendar) => ({
                    name: calendar.displayName as string,
                    value: calendar.displayName as string,
                }));
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'calendar') {
                    // Kalenderoperationen
                    if (operation === 'create') {
                        const name = this.getNodeParameter('name', i) as string;
                        const additionalFields = this.getNodeParameter('calendarSettings', i, {}) as IDataObject;
                        const calendarData: ICalendarCreate = {
                            displayName: name,
                            ...additionalFields,
                        };
                        const response = await calendarActions.createCalendar(this, calendarData);
                        returnData.push({ json: response });
                    } else if (operation === 'delete') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const response = await calendarActions.deleteCalendar(this, calendarName);
                        returnData.push({ json: response });
                    } else if (operation === 'getAll') {
                        const response = await calendarActions.getCalendars(this);
                        returnData.push({ json: { calendars: response } });
                    }
                } else if (resource === 'event') {
                    if (operation === 'create') {
                        // Pflichtfelder abrufen
                        const title = this.getNodeParameter('title', i) as string;
                        const start = this.getNodeParameter('start', i) as string;
                        const end = this.getNodeParameter('end', i) as string;
                        const calendarName = this.getNodeParameter('calendarName', i) as string;

                        // Validiere Start- und Endzeit
                        if (new Date(end) <= new Date(start)) {
                            throw new NodeOperationError(this.getNode(), 'Endzeit muss nach der Startzeit liegen', {
                                itemIndex: i,
                            });
                        }

                        // Zusätzliche Felder abrufen
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
                        
                        // Event-Daten zusammenstellen
                        const eventData: IEventCreate = {
                            title,
                            start,
                            end,
                            calendarName,
                            description: additionalFields.description as string,
                            location: additionalFields.location as string,
                        };

                        // Teilnehmer verarbeiten, wenn vorhanden
                        if (additionalFields.addAttendees && additionalFields.attendees) {
                            const attendeeFields = (additionalFields.attendees as IDataObject).attendeeFields as IDataObject[];
                            if (Array.isArray(attendeeFields)) {
                                eventData.attendees = attendeeFields.map(attendee => {
                                    // E-Mail-Validierung
                                    if (!attendee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email as string)) {
                                        throw new NodeOperationError(this.getNode(), `Ungültige E-Mail-Adresse: ${attendee.email}`, {
                                            itemIndex: i,
                                        });
                                    }
                                    return {
                                        email: attendee.email as string,
                                        displayName: attendee.displayName as string,
                                        role: attendee.role as 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'CHAIR',
                                        rsvp: attendee.rsvp as boolean,
                                    };
                                });
                            }
                        }

                        const response = await eventActions.createEvent(this, eventData);
                        if (!response) {
                            throw new NodeOperationError(this.getNode(), 'Termin konnte nicht erstellt werden - keine Antwort vom Server', {
                                itemIndex: i,
                            });
                        }
                        returnData.push({ json: parseNextcloudResponse(response) });
                    } else if (operation === 'delete') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const response = await eventActions.deleteEvent(this, calendarName, eventId);
                        if (!response || !response.success) {
                            throw new NodeOperationError(this.getNode(), 'Termin konnte nicht gelöscht werden', {
                                itemIndex: i,
                            });
                        }
                        returnData.push({ json: response });
                    } else if (operation === 'get') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const response = await eventActions.getEvent(this, calendarName, eventId);
                        if (!response) {
                            throw new NodeOperationError(this.getNode(), 'Termin konnte nicht gefunden werden', {
                                itemIndex: i,
                            });
                        }
                        returnData.push({ json: parseNextcloudResponse(response) });
                    } else if (operation === 'getAll') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const start = this.getNodeParameter('start', i) as string;
                        const end = this.getNodeParameter('end', i) as string;
                        const response = await eventActions.getEvents(this, calendarName, start, end);
                        if (!response || !Array.isArray(response)) {
                            throw new NodeOperationError(this.getNode(), 'Keine Termine gefunden oder ungültige Antwort vom Server', {
                                itemIndex: i,
                            });
                        }
                        const parsedEvents = response.map(event => parseNextcloudResponse(event));
                        returnData.push({ json: { events: parsedEvents } });
                    } else if (operation === 'update') {
                        const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        
                        // Validiere Start- und Endzeit, wenn beide angegeben sind
                        if (updateFields.start && updateFields.end) {
                            if (new Date(updateFields.end as string) <= new Date(updateFields.start as string)) {
                                throw new NodeOperationError(this.getNode(), 'Endzeit muss nach der Startzeit liegen', {
                                    itemIndex: i,
                                });
                            }
                        }
                        
                        const updateData: IEventUpdate = {
                            calendarName,
                            eventId,
                            title: updateFields.title as string,
                            start: updateFields.start as string,
                            end: updateFields.end as string,
                            description: updateFields.description as string | undefined,
                            location: updateFields.location as string | undefined,
                        };
                        
                        const response = await eventActions.updateEvent(this, updateData);
                        if (!response) {
                            throw new NodeOperationError(this.getNode(), 'Termin konnte nicht aktualisiert werden', {
                                itemIndex: i,
                            });
                        }
                        returnData.push({ json: parseNextcloudResponse(response) });
                    } else if (operation === 'nextEvents') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const now = new Date();
                        const end = new Date();
                        end.setMonth(end.getMonth() + 1); // Standardmäßig einen Monat in die Zukunft

                        const response = await eventActions.getEvents(
                            this,
                            calendarName,
                            now.toISOString(),
                            end.toISOString(),
                        );
                        if (!response || !Array.isArray(response)) {
                            throw new NodeOperationError(this.getNode(), 'Keine Termine gefunden oder ungültige Antwort vom Server', {
                                itemIndex: i,
                            });
                        }
                        const parsedEvents = response.map(event => parseNextcloudResponse(event));
                        returnData.push({ json: { events: parsedEvents } });
                    }
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}

