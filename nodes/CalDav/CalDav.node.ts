/* eslint-disable n8n-nodes-base/node-class-description-credentials-name-unsuffixed */

import {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    INodeExecutionData,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription,
    IDataObject,
    NodeConnectionType,
} from 'n8n-workflow';

import { calendarOperations, calendarFields } from './descriptions/calendar';
import { eventOperations, eventFields } from './descriptions/event';

import * as calendarActions from './actions/calendar';
import * as eventActions from './actions/event';
import { getNextcloudHeaders, formatNextcloudEvent, parseNextcloudResponse } from './helpers/nextcloud';
import { ICalendarCreate, ICalendarResponse } from './interfaces/calendar';

export class CalDav implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'CalDAV',
        name: 'calDav',
        icon: 'file:caldav.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Verwalten Sie Ihre Kalender und Termine mit Nextcloud CalDAV',
        defaults: {
            name: 'CalDAV',
        },
        inputs: [{ type: NodeConnectionType.Main }],
        outputs: [{ type: NodeConnectionType.Main }],
        credentials: [
            {
                name: 'calDavBasicAuth',
                required: true,
                displayName: 'CalDAV Zugangsdaten',
            },
        ],
        usableAsTool: true,
        properties: [
            {
                displayName: 'Ressource',
                name: 'resource',
                type: 'options',
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
            // Nextcloud-spezifische Einstellungen
            {
                displayName: 'Nextcloud-Einstellungen',
                name: 'nextcloudSettings',
                type: 'collection',
                placeholder: 'Nextcloud-Einstellungen hinzufügen',
                default: {},
                options: [
                    {
                        displayName: 'Export-Buttons ausblenden',
                        name: 'hideEventExport',
                        type: 'boolean',
                        default: false,
                        description: 'Blendet die Export-Buttons in der Benutzeroberfläche aus',
                    },
                    {
                        displayName: 'Einladungen senden',
                        name: 'sendInvitations',
                        type: 'boolean',
                        default: true,
                        description: 'Aktiviert das Senden von Einladungen an Teilnehmer',
                    },
                    {
                        displayName: 'Benachrichtigungen aktivieren',
                        name: 'enableNotifications',
                        type: 'boolean',
                        default: true,
                        description: 'Aktiviert Benachrichtigungen für Termine',
                    },
                    {
                        displayName: 'Push-Benachrichtigungen',
                        name: 'enablePushNotifications',
                        type: 'boolean',
                        default: true,
                        description: 'Aktiviert Push-Benachrichtigungen für Termine',
                    },
                    {
                        displayName: 'Erinnerungstyp erzwingen',
                        name: 'forceEventAlarmType',
                        type: 'options',
                        options: [
                            {
                                name: 'E-Mail',
                                value: 'EMAIL',
                                description: 'Erinnerungen per E-Mail senden',
                            },
                            {
                                name: 'Benachrichtigung',
                                value: 'DISPLAY',
                                description: 'Erinnerungen als Systembenachrichtigung anzeigen',
                            },
                        ],
                        default: 'DISPLAY',
                        description: 'Legt den Typ der Terminerinnerungen fest',
                    },
                ],
            },
            ...calendarOperations,
            ...calendarFields,
            ...eventOperations,
            ...eventFields,
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
        const nextcloudSettings = this.getNodeParameter('nextcloudSettings', 0, {}) as IDataObject;

        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'calendar') {
                    // Kalenderoperationen
                    if (operation === 'create') {
                        const calendarData = this.getNodeParameter('calendarFields', i) as ICalendarCreate;
                        const response = await calendarActions.createCalendar(this, calendarData);
                        returnData.push({ json: response });
                    } else if (operation === 'delete') {
                        const calendarName = this.getNodeParameter('name', i) as string;
                        const response = await calendarActions.deleteCalendar(this, calendarName);
                        returnData.push({ json: response });
                    } else if (operation === 'getAll') {
                        const response = await calendarActions.getCalendars(this);
                        returnData.push({ json: { calendars: response } });
                    }
                } else if (resource === 'event') {
                    // Terminoperationen mit Nextcloud-Anpassungen
                    if (operation === 'create') {
                        const eventData = this.getNodeParameter('eventFields', i) as IDataObject;
                        const formattedEvent = formatNextcloudEvent(eventData);
                        const response = await eventActions.createEvent(this, formattedEvent);
                        returnData.push({ json: parseNextcloudResponse(response) });
                    } else if (operation === 'delete') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const response = await eventActions.deleteEvent(this, calendarName, eventId);
                        returnData.push({ json: response });
                    } else if (operation === 'get') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const response = await eventActions.getEvent(this, calendarName, eventId);
                        returnData.push({ json: parseNextcloudResponse(response) });
                    } else if (operation === 'getAll') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const filters = this.getNodeParameter('filters', i) as IDataObject;
                        const response = await eventActions.getEvents(this, calendarName, filters);
                        const parsedEvents = response.map(event => parseNextcloudResponse(event));
                        returnData.push({ json: { events: parsedEvents } });
                    } else if (operation === 'update') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const eventData = this.getNodeParameter('updateFields', i) as IDataObject;
                        const formattedEvent = formatNextcloudEvent(eventData);
                        const response = await eventActions.updateEvent(this, calendarName, eventId, formattedEvent);
                        returnData.push({ json: parseNextcloudResponse(response) });
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
