import { INodeProperties } from 'n8n-workflow';
import { ICodex } from '../interfaces/ICodex';

// Definiere die Codex-Typen für die Kalender-Operationen
const listCalendarsCodex: ICodex = {
    type: 'action',
    summary: 'Kalender anzeigen',
    description: 'Zeigt eine übersichtliche Liste aller Ihrer Kalender an. Sie sehen auf einen Blick Namen, Farben, Zeitzonen und wer Zugriff hat.',
    examples: [
        'Zeige alle meine Kalender',
        'Welche Kalender sind verfügbar?',
        'Liste die Team-Kalender auf',
        'Zeige geteilte Kalender',
        'Welche Kalender kann ich bearbeiten?',
        'Zeige nur die Kalender, die ich erstellt habe',
        'Liste Kalender nach Berechtigungen sortiert'
    ]
};

const createCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender erstellen',
    description: 'Erstellt einen neuen Kalender ganz nach Ihren Wünschen. Sie können Namen, Farbe, Zeitzone und Berechtigungen direkt beim Erstellen festlegen.',
    examples: [
        'Erstelle einen neuen Kalender "Projekt Alpha"',
        'Lege einen Team-Kalender an',
        'Erstelle einen privaten Kalender',
        'Neuer Kalender mit Zeitzone Europe/Berlin',
        'Erstelle einen geteilten Kalender für das Marketing-Team',
        'Neuer Kalender mit automatischen Benachrichtigungen',
        'Erstelle einen Ressourcen-Kalender für Meetingräume'
    ]
};

const configureCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender konfigurieren',
    description: 'Passt die Einstellungen eines bestehenden Kalenders an, einschließlich Name, Farbe, Zeitzone, Benachrichtigungen und Freigaben.',
    examples: [
        'Ändere die Farbe des Team-Kalenders auf Blau',
        'Stelle die Zeitzone auf Europe/Berlin',
        'Aktiviere Benachrichtigungen für neue Termine',
        'Passe die Standardansicht an',
        'Ändere den Kalendernamen'
    ]
};

const shareCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender freigeben',
    description: 'Verwaltet die Freigaben und Berechtigungen für einen Kalender. Ermöglicht das Teilen mit einzelnen Personen oder Gruppen.',
    examples: [
        'Teile den Kalender mit dem Team',
        'Gib Sarah Zugriff auf den Projektkalender',
        'Mache den Kalender öffentlich lesbar',
        'Entferne die Freigabe für Max',
        'Ändere Toms Rechte auf "nur lesen"'
    ]
};

const subscribeCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender abonnieren',
    description: 'Fügt einen externen Kalender hinzu, wie Feiertage, Teamkalender oder öffentliche Veranstaltungen.',
    examples: [
        'Abonniere den Feiertagskalender',
        'Füge den Team-Kalender hinzu',
        'Importiere den Urlaubskalender',
        'Verbinde mit einem öffentlichen Kalender',
        'Abonniere den Geburstagskalender'
    ]
};

const deleteCalendarCodex: ICodex = {
    type: 'action',
    summary: 'Kalender löschen',
    description: 'Entfernt einen Kalender und alle seine Termine. Bei geteilten Kalendern werden auch alle Freigaben aufgehoben.',
    examples: [
        'Lösche den alten Projektkalender',
        'Entferne den nicht mehr benötigten Kalender',
        'Lösche meinen Test-Kalender',
        'Entferne den abgelaufenen Kalender',
        'Lösche den privaten Kalender'
    ]
};

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
                name: 'Kalender erstellen',
                value: 'create',
                description: 'Einen neuen Nextcloud-Kalender erstellen',
                action: 'Einen neuen Kalender erstellen',
            },
            {
                name: 'Kalender löschen',
                value: 'delete',
                description: 'Einen bestehenden Nextcloud-Kalender löschen',
                action: 'Einen Kalender löschen',
            },
            {
                name: 'Alle Kalender abrufen',
                value: 'getAll',
                description: 'Liste aller verfügbaren Nextcloud-Kalender abrufen',
                action: 'Alle Kalender abrufen',
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
                description: 'Zeitzone für den Kalender (z.B. Europe/Berlin)',
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
