import * as models from "./models";

export interface BusinessPartnerSearchResult {
  id: string;
  created_by: string;
  name: string;
  mobile_numbar: string;
  email: string;
  company: string;
  job_title: string;
  country?: any;
  state?: any;
  city_id: string;
  industry: string;
  tags?: any;
  status: string;
  comment?: any;
  deleted: string;
  created: string;
  updated?: any;
  continent_id: string;
  continent_name: string;
  country_id: string;
  country_name: string;
  country_short_name_alpha_2: string;
  country_short_name_alpha_3: string;
  state_id: string;
  state_name: string;
  state_short_name: string;
  city_name: string;
}
