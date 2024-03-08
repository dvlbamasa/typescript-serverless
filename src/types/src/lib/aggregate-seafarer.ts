export const AGREGATE_SEAFARER_PK = 'AGGREGATE#SEAFARER';
const TABLE_NAME = ("match-table");

export interface AggregateSeafarer {
    id: string,
    sk: string,
    data: string
}

export function createAggregateSeafarer(sk: any, value: any) {
  const aggregateSeafarerItem: AggregateSeafarer = {
    id: AGREGATE_SEAFARER_PK,
    sk: sk,
    data: value
  }
  const aggregateSeafarer = {
    Put: {
        TableName: TABLE_NAME,
        Item: aggregateSeafarerItem
    }
  }
  return aggregateSeafarer;
}