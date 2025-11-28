import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

import { SupervaizeApiClient } from '../../utils/SupervaizeApiClient';

export class SupervaizeHumanInLoop implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Supervaize Human-in-the-Loop',
		name: 'supervaizeHumanInLoop',
		icon: 'file:supervaize.svg',
		group: ['trigger'], // Acts as a trigger when resuming
		version: 1,
		description: 'Ask a question to Supervaize and wait for answer',
		defaults: {
			name: 'Supervaize Human-in-the-Loop',
		},
		inputs: ['main'],
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
				path: 'callback',
			},
		],
		properties: [
			{
				displayName: 'Workspace Slug',
				name: 'workspaceSlug',
				type: 'string',
				default: '',
				required: true,
				description: 'The slug of the workspace/team',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				default: '={{$node["Supervaize Trigger"].json["job_id"]}}',
				required: true,
				description: 'The ID of the job',
			},
			{
				displayName: 'Case Reference',
				name: 'caseRef',
				type: 'string',
				default: '',
				required: true,
				description: 'Reference ID for the case',
			},
			{
				displayName: 'Question Title',
				name: 'questionTitle',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Question Description',
				name: 'questionDescription',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Form Fields',
				name: 'formFields',
				type: 'json',
				default: '[]',
				description: 'Array of form fields',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const client = new SupervaizeApiClient(this);

		// We only process the first item for the wait node usually, or we'd need to loop.
		// But putExecutionToWait stops execution.
		// So we can only handle one item at a time effectively in this pattern, or we need to be careful.
		// For simplicity, we take the first item's params.
		const i = 0;
		
		const workspaceSlug = this.getNodeParameter('workspaceSlug', i) as string;
		const jobId = this.getNodeParameter('jobId', i) as string;
		const caseRef = this.getNodeParameter('caseRef', i) as string;
		const title = this.getNodeParameter('questionTitle', i) as string;
		const description = this.getNodeParameter('questionDescription', i) as string;
		
		let formFields = [];
		const fieldsStr = this.getNodeParameter('formFields', i) as string;
		if (fieldsStr) {
			formFields = typeof fieldsStr === 'string' ? JSON.parse(fieldsStr) : fieldsStr;
		}

		// @ts-ignore
		const webhookUrl = this.getNodeWebhookUrl('default');

		const payload = {
			event_type: 'agent.case.update',
			workspace: workspaceSlug,
			source: {
				job: jobId,
			},
			details: {
				case_ref: caseRef,
				payload: {
					supervaizer_form: {
						title,
						description,
						fields: formFields,
						callback_url: webhookUrl,
					}
				}
			}
		};

		await client.request('POST', `/w/${workspaceSlug}/api/v1/ctrl-events/`, payload);

		// Put execution to wait
		const waitData = {
			startTime: new Date().getTime(),
		};
		
		// @ts-ignore
		this.putExecutionToWait(waitData);
		
		return [[]];
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		
		return {
			webhookResponse: { status: 'accepted' },
			workflowData: [this.helpers.returnJsonArray(body as any)],
		};
	}
}
