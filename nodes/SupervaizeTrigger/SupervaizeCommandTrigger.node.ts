import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class SupervaizeCommandTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Supervaize Command Trigger',
		name: 'supervaizeCommandTrigger',
		icon: 'file:supervaize.svg',
		group: ['trigger'],
		version: 1,
		description: 'Listens for control commands from Supervaize',
		defaults: {
			name: 'Supervaize Command Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'supervaizeApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'command',
			},
		],
		properties: [
			{
				displayName: 'Validate Signature',
				name: 'validateSignature',
				type: 'boolean',
				default: true,
				description: 'Whether to validate the X-Supervaize-Signature header',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const headers = this.getHeaderData();
		const validateSignature = this.getNodeParameter('validateSignature') as boolean;

		if (validateSignature) {
			const signature = (headers as any)['x-supervaize-signature'] as string;
			if (!signature) {
				return {
					webhookResponse: 'Missing signature',
					workflowData: [this.helpers.returnJsonArray({ error: 'Missing signature' })],
				};
			}
			// Validation logic would go here
		}

		return {
			webhookResponse: { status: 'accepted' },
			workflowData: [this.helpers.returnJsonArray(body as any)],
		};
	}
}
