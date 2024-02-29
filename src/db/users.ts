import AWS, { DynamoDB } from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';


const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ("match-table");
const INDEX_NAME = 'sort_key-data-index';
const SEAFARER_STAGING = 'SEAFARER#STAGING'
const KEY_SEPARATOR = '#';
const CORPORATE_KEY = 'SEAFARER#CORPORATE';
const STATUS_KEY = 'SEAFARER#STATUS';
const LATEST_AUDIT_VERSION = formatAuditVersion(0);


class User {
    constructor(
        public id: string,
        public sk: string,
        public corporate_account: number,
        public status: string,
        public username: string, 
        public email: string, 
        public date_time: string,
        public latest: number,
        public data: string) {}
}

class Status {
    constructor(
      public id: string,
      public sk: string,
      public data: string,
      public username: string){}
}

class CorporateAccount {
  constructor(
    public id: string,
    public sk: string,
    public corporate_account: number,
    public corporate_name: string,
    public username: string,
    public data: string){}
}

export const saveUser = async (request: any) => {
    const { id, email, corporate_account, corporate_name, status, username } = request;
    const date_time = new Date().toISOString();
    let seafarer_id = id;
    if (!id) {
      seafarer_id = uuidv4();
    }
    // GET data by id if existing and retrive the value of latest
    const existingUser = await getUserById(seafarer_id);
    let latest = existingUser.Item?.latest;

    /*
     Format the sk accordingly depending on the value of the latest attribute
     If existing, increment latest value; if not, set value to 1
    */
    let auditVersion;
    if (!latest) {
      latest = 1;
      auditVersion = formatAuditVersion(latest);
    } else {
      auditVersion = formatAuditVersion(++latest);
    }

    // CREATE a new version of the data -> audit_version + 1
    await createNewItem(seafarer_id, auditVersion, corporate_account, status, username, email, date_time, latest);

    // Create STATUS ITEM
    await createStatusItem(seafarer_id, status, username);

    // Create CORPORTE ACCOUNT ITEM
    await createCorporateItem(corporate_account, seafarer_id, corporate_name, username);
    
    // CREATE latest data (v0#type) if it is not existing or UPDATE the existing latest version of the data
    return await createOrUpdateLatestItem(seafarer_id, corporate_account, status, username, email, date_time, latest);
}

export const getUsers = async (request: any) => {
  const {limit, startKey, scanIndexForward} = request;
  let gsi_pk = LATEST_AUDIT_VERSION;
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: INDEX_NAME,
    ExclusiveStartKey: startKey,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'sk',
    },
    ExpressionAttributeValues: {
      ":pk": gsi_pk,
    },
    Limit: limit,
    ScanIndexForward:scanIndexForward
  };
  return await dynamoClient.query(params, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Successful in History fetch", data);
      }
  }).promise();
}

export const getUserById = async (userId: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: userId,
      sk: LATEST_AUDIT_VERSION
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

export const getUserDataById = async (userId: string) => {
  console.log(userId)
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'id'
    },
    ExpressionAttributeValues: {
      ":pk": userId,
    }
  };
  return await dynamoClient.query(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
  }).promise();
}

export const getUserCorporateAndStatusById = async (userId: string) => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk AND (#sk BETWEEN :corp_key AND :status_key)',
    ExpressionAttributeNames: {
      "#pk": 'id',
      "#sk": 'sk'
    },
    ExpressionAttributeValues: {
      ":pk": userId,
      ":corp_key" : CORPORATE_KEY,
      ":status_key" : STATUS_KEY
    }
  };
  return await dynamoClient.query(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
  }).promise();
}

export const getUsersHistory = async (request: any, query_params: any) => {
  const { id } = request;
  const {scanIndexForward} = query_params;
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'id'
    },
    ExpressionAttributeValues: {
      ":pk": id
    },
    ScanIndexForward: scanIndexForward
  };
  const users = await dynamoClient.query(params, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Successful in History fetch", data);
      }
  }).promise();

  const items = users.Items?.filter((item)=> {
    return item.sk !== LATEST_AUDIT_VERSION;
  });
  return items;
}

async function createOrUpdateLatestItem(id: any, corporate_account: any, status: any, username: any, email: any, date_time: string, latest: any) {
  const latestUser = new User(id, LATEST_AUDIT_VERSION, corporate_account, status, username, email, date_time, latest, username);
  const params2 = {
    TableName: TABLE_NAME,
    Item: latestUser
  };
  return await dynamoClient.put(params2, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  }).promise();
}

async function createNewItem(id: any, auditVersion: string, corporate_account: any, status: any, username: any, email: any, date_time: string, latest: any) {
  const user = new User(id, auditVersion, corporate_account, status, username, email, date_time, latest, username);

  // Create condition expression to enforce eventual consistency and prevent duplicates
  const conditionExpression: string = `attribute_not_exists(id) AND attribute_not_exists(sk) AND attribute_not_exists(latest)`;
  const params = {
    TableName: TABLE_NAME,
    Item: user,
    ConditionExpression: conditionExpression
  };

  try {
    await dynamoClient.put(params).promise();
  } catch (err) {
    console.log(err);
  }
}

async function createCorporateItem(corporate_account: any, id: any, corporate_name: any, username: any) {
  const corporate_account_data: string = corporate_account;
  const corporateItem = new CorporateAccount(id, CORPORATE_KEY, corporate_account, corporate_name, username, corporate_account_data);
  const paramsCorporate = {
    TableName: TABLE_NAME,
    Item: corporateItem
  };
  await dynamoClient.put(paramsCorporate).promise();
}

async function createStatusItem(id: any, status: any, username: any) {
  const statusItem = new Status(id, STATUS_KEY, status, username);
  const paramsStatus = {
    TableName: TABLE_NAME,
    Item: statusItem
  };
  await dynamoClient.put(paramsStatus).promise();
}

function formatAuditVersion(latestValue: number): string {
  return `v${latestValue}${KEY_SEPARATOR}${SEAFARER_STAGING}`;
}