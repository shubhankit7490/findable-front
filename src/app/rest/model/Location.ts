/**
 * Findable API
 * Findable Restful API 
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as models from './models';

export interface Location {
    continent_id?: number;

    continent_name?: string;

    city_id?: number;

    city_name?: string;

    state_id?: number;

    state_name?: string;

    state_short_name?: string;

    country_id?: number;

    country_name?: string;

    country_short_name_alpha_3?: string;

    country_short_name_alpha_2?: string;
    
    name?: string; 

}
