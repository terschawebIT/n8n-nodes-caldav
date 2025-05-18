import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';

export type NextcloudCalendarFunction = IExecuteFunctions | ILoadOptionsFunctions;

export interface ICredentials {
    serverUrl: string;
    username: string;
    password: string;
}
