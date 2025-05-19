import { createUidFilter } from './filters';

/**
 * Hilfsfunktionen für Event-Operationen
 */

/**
 * Ruft ein Kalenderobjekt anhand der UID ab
 * @param client Der CalDAV-Client
 * @param calendar Das Kalenderobjekt
 * @param uid Die UID des gesuchten Events
 * @returns Das gefundene Kalenderobjekt oder wirft einen Fehler
 */
export async function getEventObjectByUid(client: any, calendar: any, uid: string) {
    const events = await client.fetchCalendarObjects({
        calendar,
        filters: createUidFilter(uid),
    });

    if (!events || events.length === 0) {
        throw new Error(`Event with ID "${uid}" not found`);
    }

    return events[0];
}

/**
 * Erstellt eine Antwortstruktur basierend auf einer Event-Operation
 * @param success War die Operation erfolgreich
 * @param operation Die durchgeführte Operation
 * @param data Die zurückzugebenden Daten
 * @param message Optionale Nachricht
 * @returns Strukturierte Antwort
 */
export function createEventResponse(
    success: boolean, 
    operation: string, 
    data: any, 
    message?: string
) {
    return {
        success,
        operation,
        resource: 'event',
        message: message || (success ? 'Operation erfolgreich' : 'Operation fehlgeschlagen'),
        data,
    };
} 