export const AGENCY_SK = 'SEAFARER#AGENCY';
const TABLE_NAME = ("match-table");

export interface SeafarerAgency {
    id: string,
    sk: string,
    username: string, 
    data: string,
    seafarer: string
}

export function createAgencyItem(id: any, agencyName: any, username: any, seafarer: any) {
  const agencyItem: SeafarerAgency = {
    id: id,
    sk: AGENCY_SK,
    data: agencyName,
    username: username,
    seafarer: seafarer
  }
  const agencyVessel = {
    Put: {
        TableName: TABLE_NAME,
        Item: agencyItem
    }
  }
  return agencyVessel;
}