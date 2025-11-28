import { SupervaizeTrigger } from '../nodes/SupervaizeTrigger/SupervaizeTrigger.node';
import { IWebhookFunctions } from 'n8n-workflow';

describe('SupervaizeTrigger', () => {
	let node: SupervaizeTrigger;
	let mockWebhookFunctions: Partial<IWebhookFunctions>;

	beforeEach(() => {
		node = new SupervaizeTrigger();
		mockWebhookFunctions = {
			getRequestObject: jest.fn().mockReturnValue({}),
			getBodyData: jest.fn().mockReturnValue({ job_id: '123' }),
			getHeaderData: jest.fn().mockReturnValue({ 'x-supervaize-signature': 'sig' }),
			getNodeParameter: jest.fn().mockReturnValue(true), // validateSignature = true
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			} as any,
		};
	});

	it('should return accepted status on valid signature', async () => {
		const result = await node.webhook.call(mockWebhookFunctions as IWebhookFunctions);

		expect(result.webhookResponse).toEqual({ status: 'accepted' });
		expect(result.workflowData).toEqual([{ job_id: '123' }]);
	});

	it('should fail on missing signature', async () => {
		mockWebhookFunctions.getHeaderData = jest.fn().mockReturnValue({});
		const result = await node.webhook.call(mockWebhookFunctions as IWebhookFunctions);

		expect(result.webhookResponse).toEqual('Missing signature');
	});
});
