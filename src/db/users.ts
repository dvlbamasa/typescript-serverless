import AWS, { DynamoDB } from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ("User");

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
    let date_time = new Date().toISOString();
    const existingUser = await getUserById(id);

    let latest = existingUser.Item?.latest;
    let latestVersion;

    if (!latest) {
      latestVersion = 'v1_audit';
      latest = 1;
    } else {
      latest = latest + 1;
      latestVersion = 'v' + latest + '_audit';
    }

    const latestUser = new User (id, 'v0_audit', username, email, date_time, latest);
    const user = new User (id, latestVersion, username, email, date_time, latest);
    console.log(user);
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
      audit_version: 'v0_audit'
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
    return item.audit_version !== 'v0_audit';
  });
  return items;
}