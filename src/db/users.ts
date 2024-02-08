import AWS, { DynamoDB } from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ("User");
const LATEST_VERSION = 'v0_audit';

class User {
    constructor(
        public id: string,
        public audit_version: string,
        public username: string, 
        public email: string, 
        public date_time: string,
        public latest: number) {}
}

export const saveUser = async (id: string, username: string, email: string) => {
    const date_time = new Date().toISOString();

    // GET data by id if existing and retrive the value for latest
    const existingUser = await getUserById(id);
    let latest = existingUser.Item?.latest;

    let auditVersion;
    // Format the audit_version accordingly depending on the value of latest
    // If existing, increment latest value; if not, set value to 1
    if (!latest) {
      latest = 1;
      auditVersion = formatAuditVersion(latest);
    } else {
      auditVersion = formatAuditVersion(++latest);
    }

    // CREATE a new version of the data - audit_version + 1
    const user = new User (id, auditVersion, username, email, date_time, latest);
    const params = {
        TableName: TABLE_NAME,
        Item: user
    };
    await dynamoClient.put(params, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
        }
    }).promise();

    // CREATE if latest data is not existing or UPDATE the latest version of the data
    const latestUser = new User (id, LATEST_VERSION, username, email, date_time, latest);
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

export const getUsers = async () => {
    const params = {
        TableName: TABLE_NAME
    };
    return await dynamoClient.scan(params, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
        }
    }).promise();
}

export const getUserById = async (userId: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: userId,
      audit_version: LATEST_VERSION
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

export const getUsersHistory = async (userId: string) => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'id'
    },
    ExpressionAttributeValues: {
      ":pk": userId
    }
  };
  const users = await dynamoClient.query(params, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Successful in History fetch", data);
      }
  }).promise();

  const items = users.Items?.filter((item)=> {
    return item.audit_version !== LATEST_VERSION;
  });
  return items;
}

function formatAuditVersion(latestValue: number): string {
  return 'v' + latestValue + '_audit';
}