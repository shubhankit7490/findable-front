import * as models from "./models";

export interface BusinessPartner {
  userId: number;

  company_id?:  models.DictionaryItem;

  location?: models.Location;

  jobTitles?: models.DictionaryItem[];
}
