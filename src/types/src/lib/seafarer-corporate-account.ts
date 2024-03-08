export const CORPORATE_SK = 'SEAFARER#CORPORATE';
const TABLE_NAME = ("match-table");

export interface SeafarerCorporateAccount {
    id: string,
    sk: string,
    corporateAccount: number,
    corporateName: string,
    username: string, 
    data: string,
    seafarer: string
}
    
export function createCorporateItem(corporateAccount: any, id: any, corporateName: any, username: any, item: any) {
    const corporateItem: SeafarerCorporateAccount = {
      id: id,
      sk: CORPORATE_SK,
      data: corporateAccount,
      corporateAccount: corporateAccount,
      corporateName: corporateName,
      username: username,
      seafarer: item
    }
    const saveCorporate = {
      Put: {
          TableName: TABLE_NAME,
          Item: corporateItem
      }
    }
    return saveCorporate;
  }