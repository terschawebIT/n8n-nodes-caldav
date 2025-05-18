import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';
import { INodeProperties } from 'n8n-workflow';

export type CalDavFunction = IExecuteFunctions | ILoadOptionsFunctions;

export interface ICredentials {
    serverUrl: string;
    username: string;
    password: string;
}
