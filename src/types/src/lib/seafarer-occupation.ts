export const OCCUPATION_SK = 'SEAFARER#OCCUPATION';
const TABLE_NAME = ("match-table");

export interface SeafarerOccupation {
    id: string,
    sk: string,
    username: string, 
    data: string,
    seafarer: string
}

export function createOccupationItem(id: any, occupation: any, username: any, seafarer: any) {
    const occupationItem: SeafarerOccupation = {
      id: id,
      sk: OCCUPATION_SK,
      data: occupation,
      username: username,
      seafarer: seafarer
    }
    const saveOccupation = {
      Put: {
          TableName: TABLE_NAME,
          Item: occupationItem
      }
    }
    return saveOccupation;
}