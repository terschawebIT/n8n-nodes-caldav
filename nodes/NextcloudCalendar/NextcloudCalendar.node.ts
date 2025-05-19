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

// Beschreibungen importieren
import {
    resources,
    calendarOperations,
    calendarFields,
    eventOperations,
    eventFields,
} from './descriptions';

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
            resources[0],
            
            // Kalender-Operationen
            calendarOperations[0],
            
            // Event-Operationen
            eventOperations[0],
            
            // Feld-Definitionen
            ...calendarFields,
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
                        // Zeitraumparameter aus UI hinzufügen
                        const maxEvents = this.getNodeParameter('maxEvents', i, 10) as number;
                        const now = new Date();
                        const end = new Date();
                        end.setMonth(end.getMonth() + 1); // Standardmäßig einen Monat in die Zukunft

                        console.log(`Suche Termine in Kalender "${calendarName}" von ${now.toISOString()} bis ${end.toISOString()}`);
                        
                        const response = await eventActions.getEvents(
                            this,
                            calendarName,
                            now.toISOString(),
                            end.toISOString(),
                        );
                        
                        if (!response) {
                            console.log('Keine Antwort vom Server erhalten');
                            throw new NodeOperationError(this.getNode(), 'Keine Antwort vom Server', {
                                itemIndex: i,
                            });
                        }

                        console.log(`Anzahl gefundener Termine: ${Array.isArray(response) ? response.length : 0}`);
                        
                        if (!Array.isArray(response) || response.length === 0) {
                            // Auch bei leerer Liste ein Ergebnis zurückgeben
                            returnData.push({ 
                                json: { 
                                    events: [],
                                    message: 'Keine Termine im angegebenen Zeitraum gefunden'
                                } 
                            });
                        } else {
                            // Termine zurückgeben und auf maxEvents beschränken
                            const parsedEvents = response
                                .slice(0, maxEvents)
                                .map(event => {
                                    const parsed = parseNextcloudResponse(event);
                                    console.log(`Verarbeite Termin: ${JSON.stringify(parsed)}`);
                                    return parsed;
                                });
                            
                            returnData.push({ 
                                json: { 
                                    events: parsedEvents,
                                    count: parsedEvents.length,
                                    totalCount: response.length
                                } 
                            });
                        }
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

