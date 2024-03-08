export const VESSEL_SK = 'SEAFARER#VESSEL';
const TABLE_NAME = ("match-table");

export interface SeafarerVessel {
    id: string,
    sk: string,
    username: string, 
    data: string,
    seafarer: string
}

export function createVesselItem(id: any, vesselName: any, username: any, seafarer: any) {
    const vesselItem: SeafarerVessel = {
      id: id,
      sk: VESSEL_SK,
      data: vesselName,
      username: username,
      seafarer: seafarer
    }
    const saveVessel = {
      Put: {
          TableName: TABLE_NAME,
          Item: vesselItem
      }
    }
    return saveVessel;
  }