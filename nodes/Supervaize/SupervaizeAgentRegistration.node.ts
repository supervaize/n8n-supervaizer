import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { SupervaizeApiClient } from '../../utils/SupervaizeApiClient';

export class SupervaizeAgentRegistration implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Supervaize Agent Registration',
		name: 'supervaizeAgentRegistration',
		icon: 'file:supervaize.svg',
		group: ['transform'],
		version: 1,
		description: 'Register n8n workflow as a Supervaize Agent',
		defaults: {
			name: 'Supervaize Agent Registration',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'supervaizeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Agent Name',
				name: 'agentName',
				type: 'string',
				default: '',
				required: true,
				description: 'Display name for the agent',
			},
			{
				displayName: 'Agent Slug',
				name: 'agentSlug',
				type: 'string',
				default: '',
				required: true,
				description: 'Unique identifier for the agent',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of what the agent does',
			},
			{
				displayName: 'Methods',
				name: 'methods',
				type: 'json',
				default: '{}',
				description: 'JSON defining job_start, job_stop, etc.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const client = new SupervaizeApiClient(this);

		for (let i = 0; i < items.length; i++) {
			try {
				const workspaceSlug = await client.getWorkspaceSlug();
				const agentName = this.getNodeParameter('agentName', i) as string;
				const agentSlug = this.getNodeParameter('agentSlug', i) as string;
				const description = this.getNodeParameter('description', i) as string;
				
				let methods = {};
				const methodsStr = this.getNodeParameter('methods', i) as string;
				if (methodsStr) {
					methods = typeof methodsStr === 'string' ? JSON.parse(methodsStr) : methodsStr;
				}

				// Parameters setup will be derived automatically in future versions
				const parametersSetup: any[] = [];

				const payload = {
					event_type: 'server.register',
					workspace: workspaceSlug,
					details: {
						agents: [
							{
								name: agentName,
								slug: agentSlug,
								description: description,
								methods: methods,
								parameters_setup: parametersSetup,
								deployment_config: {
									type: 'n8n',
								}
							}
						]
					}
				};

				const response = await client.request('POST', `/api/v1/ctrl-events/`, payload);

				returnData.push({
					json: {
						success: true,
						response,
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					returnData.push({ json: { error: errorMessage } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
