import AWS, { DynamoDB } from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ("User");
const INDEX_NAME = 'sort_key-data-index';
const LATEST_VERSION = 'v0#';
const KEY_SEPARATOR = '#';
const CORPORATE_KEY = 'CORPORATE';
const STATUS_KEY = 'STATUS';

class User {
    constructor(
        public id: string,
        public sort_key: string,
        public user_type: string,
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
      public sort_key: string,
      public data: string,
      public username: string){}
}

class CorporateAccount {
  constructor(
    public id: string,
    public sort_key: string,
    public corporate_account: number,
    public corporate_name: string,
    public username: string,
    public data: string){}
}

export const saveUser = async (request: any) => {
    const { id, email, user_type, corporate_account, corporate_name, status, username } = request;
    const date_time = new Date().toISOString();

    // GET data by id if existing and retrive the value of latest
    const existingUser = await getUserById(id, user_type);
    let latest = existingUser.Item?.latest;

    /*
     Format the sort_key accordingly depending on the value of the latest attribute
     If existing, increment latest value; if not, set value to 1
    */
    let auditVersion;
    if (!latest) {
      latest = 1;
      auditVersion = formatAuditVersion(latest, user_type);
    } else {
      auditVersion = formatAuditVersion(++latest, user_type);
    }

    // CREATE a new version of the data - audit_version + 1
    const user = new User (id, auditVersion, user_type, corporate_account, status, username, email, date_time, latest, user_type);

    // Create condition expression to enforce eventual consistency and prevent duplicates
    const conditionExpression:string = `attribute_not_exists(id) AND attribute_not_exists(sort_key) AND attribute_not_exists(latest)`;
    
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

    const statusItem = new Status(id, STATUS_KEY, status, username);
    const paramsStatus = {
      TableName: TABLE_NAME,
      Item: statusItem
    };
    await dynamoClient.put(paramsStatus).promise();

    const corporate_account_data:string = corporate_account;
    const corporateItem = new CorporateAccount(id, CORPORATE_KEY, corporate_account, corporate_name, username, corporate_account_data);
    const paramsCorporate = {
      TableName: TABLE_NAME,
      Item: corporateItem
    };
    await dynamoClient.put(paramsCorporate).promise();
    
    // CREATE latest data (v0#type) if it is not existing or UPDATE the existing latest version of the data
    const LATEST_AUDIT_VERSION = formatAuditVersion(0, user_type);
    const latestUser = new User (id, LATEST_AUDIT_VERSION, user_type, corporate_account, status, username, email, date_time, latest, user_type);
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

export const getUsers = async (user_type: string, request: any) => {
  const {limit, startKey, scanIndexForward, corporate_account, status} = request;
  let gsi_pk = LATEST_VERSION + user_type;
  let gsi_sk = user_type;
  if (corporate_account) {
    gsi_pk = CORPORATE_KEY;
    gsi_sk = corporate_account;
  }
  else if (status) {
    gsi_pk = STATUS_KEY;
    gsi_sk = status;
  }
  console.log(gsi_pk + " " + gsi_sk);
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: INDEX_NAME,
    ExclusiveStartKey: startKey,
    KeyConditionExpression: '#pk = :pk and #sk = :sk',
    ExpressionAttributeNames: {
      "#pk": 'sort_key',
      "#sk": 'data'
    },
    ExpressionAttributeValues: {
      ":pk": gsi_pk,
      ":sk": gsi_sk
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

export const getUserById = async (userId: string, user_type: string) => {
  const LATEST_AUDIT_VERSION = LATEST_VERSION + user_type;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: userId,
      sort_key: LATEST_AUDIT_VERSION
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

export const getUsersHistory = async (request: any, query_params: any) => {
  const { type, id } = request;
  const {scanIndexForward} = query_params;
  const LATEST_AUDIT_VERSION = LATEST_VERSION + type;
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'id'
    },
    ExpressionAttributeValues: {
      ":pk": id,
      ":type_value": type
    },
    FilterExpression: 'user_type =  :type_value',
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
    return item.sort_key !== LATEST_AUDIT_VERSION;
  });
  return items;
}

function formatAuditVersion(latestValue: number, user_type: string): string {
  return `v${latestValue}${KEY_SEPARATOR}${user_type}`;
}