import AWS, { DynamoDB } from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ("User");
const INDEX_NAME = 'audit_version-index';
const LATEST_VERSION = 'v0_';

class User {
    constructor(
        public id: string,
        public audit_version: string,
        public user_type: string,
        public username: string, 
        public email: string, 
        public date_time: string,
        public latest: number) {}
}

export const saveUser = async (request: any) => {
    const { id, email, user_type, username } = request;
    const date_time = new Date().toISOString();

    // GET data by id if existing and retrive the value of latest
    const existingUser = await getUserById(id, user_type);
    let latest = existingUser.Item?.latest;

    let auditVersion;
    /*
     Format the audit_version accordingly depending on the value of the latest attribute
     If existing, increment latest value; if not, set value to 1
    */
    if (!latest) {
      latest = 1;
      auditVersion = formatAuditVersion(latest, user_type);
    } else {
      auditVersion = formatAuditVersion(++latest, user_type);
    }

    // CREATE a new version of the data - audit_version + 1
    const user = new User (id, auditVersion, user_type, username, email, date_time, latest);

    // Create condition expression to enforce eventual consistency and prevent duplicates
    const conditionExpression:string = `attribute_not_exists(id) AND attribute_not_exists(audit_version) AND attribute_not_exists(latest)`;
    
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
    
    // CREATE latest data (v0_type) if it is not existing or UPDATE the existing latest version of the data
    const LATEST_AUDIT_VERSION = LATEST_VERSION + user_type;
    const latestUser = new User (id, LATEST_AUDIT_VERSION, user_type, username, email, date_time, latest);
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
  const {limit, startKey, scanIndexForward} = request;
  const LATEST_AUDIT_VERSION = LATEST_VERSION + user_type;
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    IndexName: INDEX_NAME,
    ExclusiveStartKey: startKey,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'audit_version'
    },
    ExpressionAttributeValues: {
      ":pk": LATEST_AUDIT_VERSION
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
      audit_version: LATEST_AUDIT_VERSION
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
    return item.audit_version !== LATEST_AUDIT_VERSION;
  });
  return items;
}

function formatAuditVersion(latestValue: number, user_type: string): string {
  return 'v' + latestValue + '_' + user_type;
}