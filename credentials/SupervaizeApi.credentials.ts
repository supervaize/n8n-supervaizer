import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SupervaizeApi implements ICredentialType {
	name = 'supervaizeApi';
	displayName = 'Supervaize API';
	documentationUrl = 'https://supervaize.com/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The API key for authentication',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.supervaize.com',
			required: true,
			description: 'The base URL of the Supervaize instance',
		},
	];
}
