export const STATUS_SK = 'SEAFARER#STATUS';
const TABLE_NAME = ("match-table");

export interface SeafarerStatus {
    id: string,
    sk: string,
    username: string, 
    data: string,
    statusDescription: string,
    seafarer: string
}
    
export function createStatusItem(id: any, status: any, username: any, item: any) {
    const statusItem: SeafarerStatus = {
      id: id,
      sk: STATUS_SK,
      data: status,
      username: username,
      statusDescription: "Sample Description",
      seafarer: item
    }
    const saveStatus = {
      Put: {
          TableName: TABLE_NAME,
          Item: statusItem
      }
    }
    return saveStatus;
  }