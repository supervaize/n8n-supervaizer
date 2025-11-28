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
			getWorkspaceSlug: jest.fn().mockResolvedValue('test-workspace'),
		};
		(SupervaizeApiClient as jest.Mock).mockImplementation(() => mockClient);

		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn((paramName: string, _index: number) => {
				const params: any = {
					agentName: 'Test Agent',
					agentSlug: 'test-agent',
					description: 'Test Description',
					methods: '{}',
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
			'/api/v1/ctrl-events/',
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
		});
	});
});
