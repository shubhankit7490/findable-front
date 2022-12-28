import { LocationExt } from "../service/extended-models/LocationExt";
import { BusinessPartnerRequest } from "./BusinessPartnerRequest";

export interface BusinessPartnerUpdateRequest extends BusinessPartnerRequest {
  comment: string;
  industry: string;
}
