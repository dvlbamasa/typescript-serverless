import AWS from 'aws-sdk';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { AGREGATE_SEAFARER_PK, createAggregateSeafarer } from '../types/src/index';
import { AGREGATE_SEAFARER_STATUS_PK, createAggregateSeafarerStatus } from '../types/src/index';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = ("match-table");

export const doAggregation = async (request:any) => {
    const {seafarerType, status} = request;
    const seafarerAggregate = await getItemByPrimaryKey(AGREGATE_SEAFARER_PK, seafarerType);
    let seafarerAggregateCount = incrementCount(seafarerAggregate.Item?.data);

    const seafarerStatusAggregate = await getItemByPrimaryKey(AGREGATE_SEAFARER_STATUS_PK, status);
    let seafarerStatusAggregateCount = incrementCount(seafarerStatusAggregate.Item?.data);

    const saveSeafarerAggregate = createAggregateSeafarer(seafarerType, seafarerAggregateCount);
    const saveSeafarerStatusAggregate = createAggregateSeafarerStatus(status, seafarerStatusAggregateCount);

    const params = {
        TransactItems: [
            saveSeafarerAggregate,
            saveSeafarerStatusAggregate
        ]
    }
    console.log(params);
    try {
        dynamoDbClient.send(new TransactWriteCommand(params));
     } catch (err) {
       console.log(err);
     }
}

export const getItemByPrimaryKey = async (pk: string, sk: string) => {
    const params ={
      TableName: TABLE_NAME,
      Key: {
        id: pk,
        sk: sk
      }
    };
    return await dynamoClient.get(params, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
        }
    }).promise();
  }

  function incrementCount(aggregateCount:string) {
    if (!aggregateCount) {
        aggregateCount = '1';
    } else {
        let count = parseInt(aggregateCount);
        count++;
        aggregateCount = count.toString();
    }
    return aggregateCount;
  }