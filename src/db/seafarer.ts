import { DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import {v4 as uuidv4} from 'uuid';
import { createAgencyItem, createCorporateItem, createSeafarerItem, createSourceItem, createStatusItem, createVesselItem, createOccupationItem, CORPORATE_SK, STATUS_SK, OCCUPATION_SK, AGENCY_SK, SOURCE_SK, VESSEL_SK} from '../types/src/index';
import { doAggregation } from './aggregate';

const dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = ("match-table");
const INDEX_NAME = 'sk-data-index';
const LATEST_AUDIT_VERSION = formatAuditVersion(0);

export const saveSeafarer = async (request: any) => {
    const { id, email, corporateAccount, corporateName, status, username, occupation, agencyName, source, vesselName } = request;
    const date_time = new Date().toISOString();
    let seafarerId = id, isCreate = false;
    if (!id) {
      isCreate = true;
      seafarerId = uuidv4();
    }
    // GET item by id and check if existing then retrive the value of latest
    const existingSeafarer = await getSeafarerById(seafarerId);
    let latest;
    if (existingSeafarer !== undefined) {
      latest = existingSeafarer.Item?.latest;
    }
    /*
     Format the sk accordingly depending on the value of the latest attribute
     If existing, increment latest value; if not, set value to 1
    */
    let auditVersion;
    if (!latest) {
      latest = 1;
      auditVersion = formatAuditVersion(latest);
    } else {
      auditVersion = formatAuditVersion(++latest);
    }

    // CREATE a new version of the item -> audit_version + 1
    const saveSeafarer = createSeafarerItem(seafarerId, auditVersion, corporateAccount, status, username, email, date_time, latest, agencyName, occupation, source, vesselName);
    console.log('SAVE SEAFARER 1: ', saveSeafarer);

    // CREATE latest data (v0#type) if it is not existing or UPDATE the existing latest version of the data
    const updateLatestSeafarer = createSeafarerItem(seafarerId, LATEST_AUDIT_VERSION, corporateAccount, status, username, email, date_time, latest, agencyName, occupation, source, vesselName);
    console.log('SAVE SEAFARER 2: ', updateLatestSeafarer);

    const seafarerItem = updateLatestSeafarer.Put.Item;
    const saveStatus = createStatusItem(seafarerId, status, username, seafarerItem);
    const saveCorporate = createCorporateItem(corporateAccount, seafarerId, corporateName, username, seafarerItem);
    const saveAgency = createAgencyItem(seafarerId, agencyName, username, seafarerItem);
    const saveOccupation = createOccupationItem(seafarerId, occupation, username, seafarerItem);
    const saveSource = createSourceItem(seafarerId, source, username, seafarerItem);
    const saveVessel = createVesselItem(seafarerId, vesselName, username, seafarerItem);

    const params = {
      TransactItems: [
        saveSeafarer,
        updateLatestSeafarer,
        saveStatus,
        saveCorporate,
        saveAgency,
        saveOccupation,
        saveSource,
        saveVessel
      ]
  };
  
  try {
     await dynamoDbClient.send(new TransactWriteCommand(params));
  } catch (err) {
    console.log(err);
  }

  const aggregateParams = {
    seafarerType: "STAGING",
    status: status
  };
  if (isCreate) {
    await doAggregation(aggregateParams);
  }
}

export const getSeafarers = async (request: any) => {
  const {startKey, scanIndexForward} = request;
  let gsi_pk = LATEST_AUDIT_VERSION;
  const queryCommand = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: INDEX_NAME,
    ExclusiveStartKey: startKey,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'sk',
    },
    ExpressionAttributeValues: {
      ":pk": gsi_pk,
    },
    ScanIndexForward:scanIndexForward
  });
  
  return await dynamoDbClient.send(queryCommand);
}

export const getSeafarerById = async (id: string) => {
    const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: id,
          sk: LATEST_AUDIT_VERSION
        }
    });
    return await dynamoDbClient.send(getCommand);
}

export const getSeafarerDataById = async (seafarerId: string) => {
  const queryCommand = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: {
      "#pk": 'id',
    },
    ExpressionAttributeValues: {
      ":pk": seafarerId,
    }
  });
  return await dynamoDbClient.send(queryCommand);
}

function formatAuditVersion(latestValue: number): string {
  return `v${latestValue}#SEAFARER#STAGING`;
}

export const filterSeafarer = async (request: any) => {
  const {corporateAccount, status, occupation, agencyName, source, vesselName, startKey, limit, scanIndexForward } = request;

  let baseSearchRequest = {
    startKey: startKey,
    limit: limit,
    scanIndexForward: scanIndexForward
  };
  let seafarersList = [];
  if (corporateAccount) {
    const seafarersByCorporate = await doFilter(CORPORATE_SK, corporateAccount, baseSearchRequest);
    seafarersList.push(seafarersByCorporate);
  }
  if (status) {
    const seafarersByStatus = await doFilter(STATUS_SK, status, baseSearchRequest);
    seafarersList.push(seafarersByStatus);
  } 
  if (occupation) {
    const seafarersByOccupation = await doFilter(OCCUPATION_SK, occupation, baseSearchRequest);
    seafarersList.push(seafarersByOccupation);
  }
  if (agencyName) {
    const seafarersByAgency = await doFilter(AGENCY_SK, agencyName, baseSearchRequest);
    seafarersList.push(seafarersByAgency);
  }
  if (source) {
    const seafarersBySource = await doFilter(SOURCE_SK, source, baseSearchRequest);
    seafarersList.push(seafarersBySource);
  }
  if (vesselName) {
    const seafarersByVessel = await doFilter(VESSEL_SK, vesselName, baseSearchRequest);
    seafarersList.push(seafarersByVessel);
  }

  return getSeafarersWithCommonId(...seafarersList);
}

const doFilter = async (sk: any, value: any, baseSearchRequest: any) => {
  let filteredSeafarers: [{}] = [{}];
  const searchRequest = {
    sk: sk,
    data: value,
    ...baseSearchRequest
  };
  const seafarers = await filterSearch(searchRequest);
  seafarers.Items?.forEach((item) => {
    const seafarerItem: { [key: string]: any } = {};
    seafarerItem[item.id] = item.seafarer;
    filteredSeafarers.push(seafarerItem);
  });
  return filteredSeafarers;
}

export const filterSearch = async (request: any) => {
  const {data, sk, scanIndexForward, startKey} = request;
  const params = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: INDEX_NAME,
    ExclusiveStartKey: startKey,
    KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
    ExpressionAttributeNames: {
      "#pk": 'sk',
      "#sk": 'data'
    },
    ExpressionAttributeValues: {
      ":pk": sk,
      ":sk": data
    },
    ScanIndexForward:scanIndexForward
  });
  return await dynamoDbClient.send(params);
}

function getSeafarersWithCommonId(...arrays: { [key: string]: any }[][]): { [key: string]: any }[] {
  const commonSeafarers: { [key: string]: any }[] = [];

  const allSeafarerIds = arrays.map(arr => arr.flatMap(obj => Object.keys(obj)));

  const commonSeafarerIds = allSeafarerIds.reduce((acc, seafarerIds) => acc.filter(id => seafarerIds.includes(id)));

  for (const seafarerId of commonSeafarerIds) {
      const seafarers = arrays.flatMap(arr => arr.filter(seafarer => seafarerId in seafarer));
      commonSeafarers.push(Object.values(seafarers[0]));
  }

  return commonSeafarers;
}