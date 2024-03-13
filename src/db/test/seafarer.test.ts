import {
	DynamoDBDocumentClient,
	GetCommand,
	TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';

import {
	getSeafarerById,
	saveSeafarer
} from '../seafarer';

import { mockClient } from 'aws-sdk-client-mock';

import {
	seafarer
} from './__fixtures__';

jest.mock('./config', () => ({
	MATCH_TABLE: 'match-table',
}));

describe('seafarer dynamo repository', () => {
	const dynamoMock = mockClient(DynamoDBDocumentClient);
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	beforeEach(() => {
		jest.clearAllMocks();
		dynamoMock.reset();
	});

	afterAll(() => {
		jest.restoreAllMocks();
		dynamoMock.restore();
	});

	describe('addSeafarer', () => {
		beforeEach(async () => {
			dynamoMock.on(GetCommand).resolvesOnce({
				Item: {
					id: '1',
					sk: 'SEAFARER#STAGING',
					data: 'name',
					corporateAccount: '123awe',
					status: 'IMPORTED',
					username: 'username',
					email: 'email',
					dateTime: 'date_time',
					latest: 1,
					agencyName: 'agencyName',
					occupation: 'occupation',
					source: 'source',
					vesselName: 'vesselName'
				},
			});

			await getSeafarerById('1');
		});

		it('should send GetCommand', () => {
			expect(
				dynamoMock.commandCalls(GetCommand)[0].args[0].input,
			).toMatchSnapshot();
		});
		it('should add seafarer', async () => {
			await saveSeafarer(seafarer);
			expect(
				dynamoMock.commandCalls(TransactWriteCommand)[0].args[0].input
			).toMatchSnapshot();
		});
    });
});