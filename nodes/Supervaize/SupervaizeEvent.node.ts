import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { SupervaizeApiClient } from '../../utils/SupervaizeApiClient';

export class SupervaizeEvent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Supervaize Event',
		name: 'supervaizeEvent',
		icon: 'file:supervaize.svg',
		group: ['transform'],
		version: 1,
		description: 'Send events to Supervaize',
		defaults: {
			name: 'Supervaize Event',
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
				displayName: 'Workspace Slug',
				name: 'workspaceSlug',
				type: 'string',
				default: '',
				required: true,
				description: 'The slug of the workspace/team',
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [
					{ name: 'Job Start Confirmation', value: 'agent.job.start.confirmation' },
					{ name: 'Job Progress', value: 'agent.job.progress' },
					{ name: 'Job End', value: 'agent.job.end' },
					{ name: 'Job Failed', value: 'agent.job.failed' },
					{ name: 'Case Start', value: 'agent.case.start' },
					{ name: 'Case Update', value: 'agent.case.update' },
					{ name: 'Case End', value: 'agent.case.end' },
				],
				default: 'agent.job.progress',
				description: 'The type of event to send',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				default: '={{$node["Supervaize Trigger"].json["job_id"]}}',
				required: true,
				description: 'The ID of the job',
			},
			// Case fields
			{
				displayName: 'Case Reference',
				name: 'caseRef',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						eventType: ['agent.case.start', 'agent.case.update', 'agent.case.end'],
					},
				},
				description: 'Reference ID for the case',
			},
			{
				displayName: 'Case Name',
				name: 'caseName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						eventType: ['agent.case.start'],
					},
				},
				description: 'Name of the case',
			},
			// Payload
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'json',
				default: '{}',
				description: 'Additional data to send with the event',
			},
			// Deliverables
			{
				displayName: 'Deliverables',
				name: 'deliverables',
				type: 'json',
				default: '[]',
				displayOptions: {
					show: {
						eventType: ['agent.job.end', 'agent.case.end'],
					},
				},
				description: 'List of files/artifacts produced',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const client = new SupervaizeApiClient(this);

		for (let i = 0; i < items.length; i++) {
			try {
				const workspaceSlug = this.getNodeParameter('workspaceSlug', i) as string;
				const eventType = this.getNodeParameter('eventType', i) as string;
				const jobId = this.getNodeParameter('jobId', i) as string;
				
				let payload = {};
				const payloadStr = this.getNodeParameter('payload', i) as string;
				if (payloadStr) {
					payload = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
				}

				const body: any = {
					event_type: eventType,
					workspace: workspaceSlug,
					source: {
						job: jobId,
					},
					details: {
						payload,
					},
				};

				if (['agent.case.start', 'agent.case.update', 'agent.case.end'].includes(eventType)) {
					const caseRef = this.getNodeParameter('caseRef', i) as string;
					body.details.case_ref = caseRef;
					// Also add to source if needed, but details.case_ref is usually enough or depends on backend
				}

				if (eventType === 'agent.case.start') {
					body.details.case_name = this.getNodeParameter('caseName', i) as string;
				}

				if (['agent.job.end', 'agent.case.end'].includes(eventType)) {
					let deliverables = [];
					const delivStr = this.getNodeParameter('deliverables', i) as string;
					if (delivStr) {
						deliverables = typeof delivStr === 'string' ? JSON.parse(delivStr) : delivStr;
					}
					body.details.deliverables = deliverables;
				}

				const response = await client.request('POST', `/w/${workspaceSlug}/api/v1/ctrl-events/`, body);

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
