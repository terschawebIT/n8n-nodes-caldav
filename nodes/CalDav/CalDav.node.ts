/* eslint-disable n8n-nodes-base/node-class-description-credentials-name-unsuffixed */

import { IExecuteFunctions } from 'n8n-core';
import {
    ILoadOptionsFunctions,
    INodeExecutionData,
    INodePropertyOptions,
    INodeType,
    INodeTypeDescription,
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
        inputs: ['main'],
        outputs: ['main'],
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
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        const results = [];

        try {
            if (resource === 'calendar') {
                if (operation === 'create') {
                    const name = this.getNodeParameter('calendarName', 0) as string;
                    const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as { timezone?: string };

                    const calendar = await calendarActions.createCalendar(this, {
                        name,
                        timezone: additionalFields.timezone,
                    });

                    results.push({ json: calendar });
                } else if (operation === 'delete') {
                    const calendarName = this.getNodeParameter('calendar', 0) as string;
                    const result = await calendarActions.deleteCalendar(this, calendarName);
                    results.push({ json: result });
                } else if (operation === 'get') {
                    const calendarName = this.getNodeParameter('calendar', 0) as string;
                    const calendars = await calendarActions.getCalendars(this);
                    const calendar = calendars.find((cal) => cal.displayName === calendarName);
                    if (calendar) {
                        results.push({ json: calendar });
                    }
                } else if (operation === 'getMany') {
                    const calendars = await calendarActions.getCalendars(this);
                    for (const calendar of calendars) {
                        results.push({ json: calendar });
                    }
                }
            } else if (resource === 'event') {
                const calendarName = this.getNodeParameter('calendar', 0) as string;

                if (operation === 'create') {
                    const eventData = {
                        calendarName,
                        title: this.getNodeParameter('eventTitle', 0) as string,
                        start: this.getNodeParameter('start', 0) as string,
                        end: this.getNodeParameter('end', 0) as string,
                    };

                    const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as {
                        description?: string;
                        location?: string;
                    };

                    if (additionalFields.description) {
                        eventData['description'] = additionalFields.description;
                    }
                    if (additionalFields.location) {
                        eventData['location'] = additionalFields.location;
                    }

                    const addAttendees = this.getNodeParameter('addAttendees', 0, false) as boolean;
                    if (addAttendees) {
                        const attendeesData = this.getNodeParameter('attendees', 0, { attendeeFields: [] }) as { attendeeFields: any[] };
                        if (attendeesData.attendeeFields && attendeesData.attendeeFields.length > 0) {
                            eventData['attendees'] = attendeesData.attendeeFields;
                        }
                    }

                    const event = await eventActions.createEvent(this, eventData);
                    results.push({ json: event });
                } else if (operation === 'delete') {
                    const eventId = this.getNodeParameter('eventId', 0) as string;
                    const result = await eventActions.deleteEvent(this, calendarName, eventId);
                    results.push({ json: result });
                } else if (operation === 'get') {
                    const eventId = this.getNodeParameter('eventId', 0) as string;
                    const event = await eventActions.getEvent(this, calendarName, eventId);
                    results.push({ json: event });
                } else if (operation === 'getMany') {
                    const start = this.getNodeParameter('start', 0) as string;
                    const end = this.getNodeParameter('end', 0) as string;
                    const events = await eventActions.getEvents(this, calendarName, start, end);
                    for (const event of events) {
                        results.push({ json: event });
                    }
                } else if (operation === 'search') {
                    const searchTerm = this.getNodeParameter('searchTerm', 0) as string;
                    const start = this.getNodeParameter('start', 0) as string;
                    const end = this.getNodeParameter('end', 0) as string;
                    const events = await eventActions.searchEvents(this, calendarName, searchTerm, start, end);
                    for (const event of events) {
                        results.push({ json: event });
                    }
                } else if (operation === 'update') {
                    const eventId = this.getNodeParameter('eventId', 0) as string;
                    const eventData = {
                        calendarName,
                        eventId,
                        title: this.getNodeParameter('eventTitle', 0) as string,
                        start: this.getNodeParameter('start', 0) as string,
                        end: this.getNodeParameter('end', 0) as string,
                    };

                    const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as {
                        description?: string;
                        location?: string;
                    };

                    if (additionalFields.description !== undefined) {
                        eventData['description'] = additionalFields.description;
                    }
                    if (additionalFields.location !== undefined) {
                        eventData['location'] = additionalFields.location;
                    }

                    const addAttendees = this.getNodeParameter('addAttendees', 0, false) as boolean;
                    if (addAttendees) {
                        const attendeesData = this.getNodeParameter('attendees', 0, { attendeeFields: [] }) as { attendeeFields: any[] };
                        if (attendeesData.attendeeFields && attendeesData.attendeeFields.length > 0) {
                            eventData['attendees'] = attendeesData.attendeeFields;
                        }
                    }

                    const event = await eventActions.updateEvent(this, eventData);
                    results.push({ json: event });
                }
            }
        } catch (error) {
            if (error.message) {
                throw new Error(`CalDAV Error: ${error.message}`);
            }
            throw error;
        }

        return this.prepareOutputData(results);
    }
}
