/* eslint-disable n8n-nodes-base/cred-class-name-unsuffixed */
/* eslint-disable n8n-nodes-base/cred-class-field-display-name-missing-api */
/* eslint-disable n8n-nodes-base/cred-class-field-name-unsuffixed */

import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NextcloudCalendarApi implements ICredentialType {
	name = 'nextcloudCalendarApi';
	displayName = 'Nextcloud Calendar API';
	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://ihre-nextcloud-instanz.de/remote.php/dav/calendars/benutzername/kalender-id',
			placeholder: 'https://cloud.example.com/remote.php/dav',
		},
        {
            displayName: 'Benutzername',
            name: 'username',
            type: 'string',
            default: '',
            placeholder: 'benutzername',
        },
        {
            displayName: 'Passwort',
            name: 'password',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
        },
	];
}
