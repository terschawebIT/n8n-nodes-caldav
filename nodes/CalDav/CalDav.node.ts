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

export class CalDav implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'CalDAV',
        name: 'calDav',
        icon: 'file:calDav.svg',
        group: ['output'],
        version: 1,
        subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
        description: 'Connect n8n to a CalDAV server',
        defaults: {
            name: 'CalDAV',
        },
        inputs: [{ type: NodeConnectionType.Main }],
        outputs: [{ type: NodeConnectionType.Main }],
        credentials: [
            {
                name: 'calDavBasicAuth',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Calendar',
                        value: 'calendar',
                    },
                    {
                        name: 'Event',
                        value: 'event',
                    }
                ],
                default: 'calendar',
                noDataExpression: true,
                required: true,
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
        const returnData: IDataObject[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                if (resource === 'calendar') {
                    if (operation === 'create') {
                        const name = this.getNodeParameter('name', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

                        const data = {
                            name,
                            timezone: additionalFields.timezone as string,
                        };

                        const response = await calendarActions.createCalendar(this, data);
                        returnData.push(response);

                    } else if (operation === 'delete') {
                        const name = this.getNodeParameter('name', i) as string;

                        const response = await calendarActions.deleteCalendar(this, name);
                        returnData.push(response);

                    } else if (operation === 'getAll') {
                        const calendars = await calendarActions.getCalendars(this);
                        returnData.push(...calendars);
                    }

                } else if (resource === 'event') {
                    if (operation === 'create') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const title = this.getNodeParameter('title', i) as string;
                        const start = this.getNodeParameter('start', i) as string;
                        const end = this.getNodeParameter('end', i) as string;
                        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

                        const eventData: IDataObject = {
                            calendarName,
                            title,
                            start,
                            end,
                        };

                        if (additionalFields.description) {
                            eventData.description = additionalFields.description;
                        }

                        if (additionalFields.location) {
                            eventData.location = additionalFields.location;
                        }

                        if (additionalFields.attendees) {
                            const attendeesData = additionalFields.attendees as IDataObject;
                            eventData.attendees = attendeesData.attendeeFields;
                        }

                        const response = await eventActions.createEvent(this, eventData as any);
                        returnData.push(response);

                    } else if (operation === 'delete') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;

                        const response = await eventActions.deleteEvent(this, calendarName, eventId);
                        returnData.push(response);

                    } else if (operation === 'get') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;

                        const event = await eventActions.getEvent(this, calendarName, eventId);
                        returnData.push(event);

                    } else if (operation === 'getAll') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const filters = this.getNodeParameter('filters', i) as IDataObject;

                        const events = await eventActions.getEvents(this, calendarName, filters.start as string, filters.end as string);
                        returnData.push(...events);

                    } else if (operation === 'update') {
                        const calendarName = this.getNodeParameter('calendarName', i) as string;
                        const eventId = this.getNodeParameter('eventId', i) as string;
                        const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

                        const eventData: IDataObject = {
                            calendarName,
                            eventId,
                            ...updateFields,
                        };

                        if (updateFields.attendees) {
                            const attendeesData = updateFields.attendees as IDataObject;
                            eventData.attendees = attendeesData.attendeeFields;
                        }

                        const response = await eventActions.updateEvent(this, eventData as any);
                        returnData.push(response);
                    }
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ error: error.message });
                    continue;
                }
                throw error;
            }
        }

        return [this.helpers.returnJsonArray(returnData)];
    }
}
