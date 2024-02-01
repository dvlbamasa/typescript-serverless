import AWS from 'aws-sdk';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = ("User");

class User {
    constructor(
        public id: string,
        public username: string, 
        public email: string, 
        public password: string) {}
}

export const saveUser = async (id: string, username: string, email: string, password: string) => {
    const user = new User (id, username, email, password);
    console.log(user);
    const params = {
        TableName: TABLE_NAME,
        Item: user
    };
    return await dynamoClient.put(params, function (err, data) {
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
