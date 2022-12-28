import * as models from "./models";

export interface BusinessPartnerSearchResponse {
    total?: number;

    token?: string;

    result?: Array<models.BusinessPartnerSearchResult>;
}
