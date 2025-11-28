import { SupervaizeEvent } from '../nodes/Supervaize/SupervaizeEvent.node';
import { IExecuteFunctions } from 'n8n-workflow';
import { SupervaizeApiClient } from '../utils/SupervaizeApiClient';

jest.mock('../utils/SupervaizeApiClient');

describe('SupervaizeEvent', () => {
	let node: SupervaizeEvent;
	let mockExecuteFunctions: Partial<IExecuteFunctions>;
	let mockClient: any;

	beforeEach(() => {
		node = new SupervaizeEvent();
		mockClient = {
			request: jest.fn().mockResolvedValue({ success: true }),
		};
		(SupervaizeApiClient as jest.Mock).mockImplementation(() => mockClient);

		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn((paramName: string) => {
				const params: any = {
					workspaceSlug: 'test-workspace',
					eventType: 'agent.job.progress',
					jobId: 'job-123',
					payload: '{}',
				};
				return params[paramName];
			}),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			} as any,
		};
	});

	it('should send an event successfully', async () => {
		const result = await node.execute.call(mockExecuteFunctions as IExecuteFunctions);

		expect(mockClient.request).toHaveBeenCalledWith(
			'POST',
			'/w/test-workspace/api/v1/ctrl-events/',
			expect.objectContaining({
				event_type: 'agent.job.progress',
				source: { job: 'job-123' },
			})
		);

		expect(result).toHaveLength(1);
		expect(result[0][0].json).toEqual({
			success: true,
			response: { success: true },
		});
	});
});
