export const SOURCE_SK = 'SEAFARER#SOURCE';
const TABLE_NAME = ("match-table");

export interface SeafarerSource {
    id: string,
    sk: string,
    username: string, 
    data: string,
    seafarer: string
}

export function createSourceItem(id: any, source: any, username: any, seafarer: any) {
    const sourceItem: SeafarerSource = {
      id: id,
      sk: SOURCE_SK,
      data: source,
      username: username,
      seafarer: seafarer
    }
    const saveSource = {
      Put: {
          TableName: TABLE_NAME,
          Item: sourceItem
      }
    }
    return saveSource;
  }