import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';

export type CalDavFunction = IExecuteFunctions | ILoadOptionsFunctions;

export interface ICredentials {
    serverUrl: string;
    username: string;
    password: string;
}
