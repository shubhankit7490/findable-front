import { LocationExt } from "../service/extended-models/LocationExt";

export interface BusinessPartnerRequest {
  name: string;
  email: string;
  mobile_numbar: string;
  company: string;
  job_title: string;
  location: LocationExt;
  tags: string;
}
