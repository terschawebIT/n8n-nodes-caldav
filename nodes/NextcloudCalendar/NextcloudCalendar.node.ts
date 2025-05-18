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
import { parseNextcloudResponse } from './helpers/nextcloud';
import { ICalendarCreate } from './interfaces/calendar';
import { IEventCreate, IEventUpdate } from './interfaces/event';

export class NextcloudCalendar implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Nextcloud Calendar',
        name: 'nextcloudCalendar',
        icon: 'file:caldav.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Verwalten Sie Ihre Kalender und Termine mit Nextcloud CalDAV',
        defaults: {
            name: 'Nextcloud Calendar',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'nextcloudCalendarApi',
                required: true,
                displayName: 'Nextcloud Calendar API',
            },
        ],
        usableAsTool: true,
        properties: [
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
            // Nextcloud-spezifische Einstellungen
            {
                displayName: 'Nextcloud Settings',
                name: 'nextcloudSettings',
                type: 'collection',
                placeholder: 'Nextcloud-Einstellungen hinzufügen',
                default: {},
                options: [
                    {
                        displayName: 'Enable Notifications',
                        name: 'enableNotifications',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to enable notifications for events',
                    },
                    {
                        displayName: 'Enable Push Notifications',
                        name: 'enablePushNotifications',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to enable push notifications for events',
                    },
                    {
                        displayName: 'Force Event Alarm Type',
                        name: 'forceEventAlarmType',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to force a specific alarm type for events',
                    },
                    {
                        displayName: 'Hide Event Export',
                        name: 'hideEventExport',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to hide the export buttons in the user interface',
                    },
                    {
                        displayName: 'Send Invitations',
                        name: 'sendInvitations',
                        type: 'boolean',
                        default: true,
                        description: 'Whether to send invitations to participants',
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
                        const eventData = this.getNodeParameter('eventFields', i) as IEventCreate;
                        const response = await eventActions.createEvent(this, eventData);
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
                        const start = this.getNodeParameter('start', i) as string;
                        const end = this.getNodeParameter('end', i) as string;
                        const response = await eventActions.getEvents(this, calendarName, start, end);
                        const parsedEvents = response.map(event => parseNextcloudResponse(event));
                        returnData.push({ json: { events: parsedEvents } });
                    } else if (operation === 'update') {
                        const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const updateData: IEventUpdate = {
                            calendarName,
                            eventId,
                            title: updateFields.title as string,
                            start: updateFields.start as string,
                            end: updateFields.end as string,
                            description: updateFields.description as string | undefined,
                            location: updateFields.location as string | undefined,
                            attendees: updateFields.attendees as any[] | undefined,
                        };
                        const response = await eventActions.updateEvent(this, updateData);
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
