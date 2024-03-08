export const AGREGATE_SEAFARER_STATUS_PK = 'AGGREGATE#SEAFARER#STATUS';
const TABLE_NAME = ("match-table");

export interface AggregateSeafarerStatus {
    id: string,
    sk: string,
    data: string
}

export function createAggregateSeafarerStatus(sk: any, value: any) {
  const aggregateSeafarerStatusItem: AggregateSeafarerStatus = {
    id: AGREGATE_SEAFARER_STATUS_PK,
    sk: sk,
    data: value
  }
  const aggregateSeafarerStatus = {
    Put: {
        TableName: TABLE_NAME,
        Item: aggregateSeafarerStatusItem
    }
  }
  return aggregateSeafarerStatus;
}