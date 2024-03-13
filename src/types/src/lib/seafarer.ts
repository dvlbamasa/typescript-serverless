const TABLE_NAME = ("match-table");
// Create condition expression to enforce eventual consistency and prevent duplicates
// const conditionExpression: string = `attribute_not_exists(id) AND attribute_not_exists(sk) AND attribute_not_exists(latest)`;

export interface Seafarer {
    id: string,
    sk: string,
    corporateAccount: string,
    status: string,
    username: string, 
    email: string, 
    dateTime: string,
    latest: number,
    data: string,
    agencyName: string,
    source: string,
    occupation: string,
    vesselName: string,
}

export function createSeafarerItem(id: any, sk: string, corporateAccount: any, status: any, username: any, email: any, date_time: string, latest: any, agencyName: string, occupation: string, source: string, vesselName: string) {
    const seafarer: Seafarer = {
      id: id,
      sk: sk,
      data: username,
      corporateAccount: corporateAccount,
      status: status,
      username: username,
      email: email,
      dateTime: date_time,
      latest: latest,
      agencyName: agencyName,
      occupation: occupation,
      source: source,
      vesselName: vesselName
    };
    const saveSeafarer = {
      Put: {
          TableName: TABLE_NAME,
          Item: seafarer
      }
    }
    return saveSeafarer;
  }
  
