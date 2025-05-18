import {
    IExecuteFunctions,
    ILoadOptionsFunctions,
} from 'n8n-workflow';

import { DAVClient } from 'tsdav';
import { CalDavFunction } from '../interfaces/common';

export async function initClient(
    this: IExecuteFunctions | ILoadOptionsFunctions,
    context: IExecuteFunctions | ILoadOptionsFunctions,
) {
    const credentials = await context.getCredentials('calDavBasicAuth');

    // Nextcloud-spezifische URL-Anpassung
    let serverUrl = credentials.serverUrl as string;
    if (!serverUrl.endsWith('/remote.php/dav')) {
        serverUrl = serverUrl.replace(/\/?$/, '/remote.php/dav');
    }

    const client = new DAVClient({
        serverUrl,
        credentials: {
            username: credentials.username as string,
            password: credentials.password as string,
        },
        defaultAccountType: 'caldav',
        authMethod: 'Basic',
        headers: {
            'User-Agent': 'n8n-nodes-caldav/1.0',
            'X-Requested-With': 'n8n',
        },
    });

    await client.login();
    return client;
}
