import { SupervaizeAgentRegistration } from '../nodes/Supervaize/SupervaizeAgentRegistration.node';
import { IExecuteFunctions } from 'n8n-workflow';
import { SupervaizeApiClient } from '../utils/SupervaizeApiClient';

jest.mock('../utils/SupervaizeApiClient');

describe('SupervaizeAgentRegistration', () => {
	let node: SupervaizeAgentRegistration;
	let mockExecuteFunctions: Partial<IExecuteFunctions>;
	let mockClient: any;

	beforeEach(() => {
		node = new SupervaizeAgentRegistration();
		mockClient = {
			request: jest.fn().mockResolvedValue({ success: true, agent_id: '123' }),
		};
		(SupervaizeApiClient as jest.Mock).mockImplementation(() => mockClient);

		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn((paramName: string) => {
				const params: any = {
					workspaceSlug: 'test-workspace',
					agentName: 'Test Agent',
					agentSlug: 'test-agent',
					description: 'Test Description',
					methods: '{}',
					parametersSetup: '[]',
					webhookUrl: 'https://test.webhook',
				};
				return params[paramName];
			}),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			} as any,
		};
	});

	it('should register an agent successfully', async () => {
		const result = await node.execute.call(mockExecuteFunctions as IExecuteFunctions);

		expect(mockClient.request).toHaveBeenCalledWith(
			'POST',
			'/w/test-workspace/api/v1/ctrl-events/',
			expect.objectContaining({
				event_type: 'server.register',
				workspace: 'test-workspace',
				details: expect.objectContaining({
					agents: expect.arrayContaining([
						expect.objectContaining({
							name: 'Test Agent',
							slug: 'test-agent',
						}),
					]),
				}),
			})
		);

		expect(result).toHaveLength(1);
		expect(result[0][0].json).toEqual({
			success: true,
			response: { success: true, agent_id: '123' },
			webhookUrl: 'https://test.webhook',
		});
	});
});
