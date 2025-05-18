import { DAVClient } from 'tsdav';
import { CalDavFunction } from '../interfaces/common';

export async function initClient(
    context: CalDavFunction,
    contextThis?: any
): Promise<DAVClient> {
    const credentials = await context.getCredentials('calDavBasicAuth');
    const client = new DAVClient({
        serverUrl: credentials.serverUrl as string,
        credentials: {
            username: credentials.username as string,
            password: credentials.password as string,
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
    });
    await client.login();
    return client;
}
