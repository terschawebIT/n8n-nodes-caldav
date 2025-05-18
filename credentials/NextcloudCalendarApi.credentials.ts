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
			displayName: 'Nextcloud URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://cloud.example.com',
			placeholder: 'https://ihre-nextcloud-instanz.de',
			description: 'Die URL Ihrer Nextcloud-Instanz (ohne /remote.php/dav/)',
		},
        {
            displayName: 'Benutzername',
            name: 'username',
            type: 'string',
            default: '',
            placeholder: 'max.mustermann',
            description: 'Ihr Nextcloud Benutzername',
        },
        {
            displayName: 'Passwort oder App-Passwort',
            name: 'password',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'Ihr Nextcloud Passwort oder ein App-Passwort (empfohlen)',
        },
	];
}
