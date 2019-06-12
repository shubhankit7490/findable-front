import {Injectable} from '@angular/core';
import * as models from '../model/models';
import * as extModels from './extended-models/extended-models';

declare let moment: any;

@Injectable()
/**
 * TransformerService is a collection of map functions called on Observable objects
 * when data arrives from the server.
 * Each function transforms a specific model, preparing it's data for display.
 */
export class PersonalDetailsService {

    constructor() {
    }

    /**
     * Transform UserPreferences model.
     * Adding "available" property with custom availability value.
     * @param value - UserPreferencesExt model
     * @param index
     * @returns {any}
     */


    public static transformPersonalDetailsPut(personalDetails) {
        personalDetails.birthday = moment(personalDetails.birthday).format('YYYY-MM-DD HH:mm:ss');
        // Remove extended properties before sending to server
        return personalDetails;
    }




}
