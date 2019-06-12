/**
 * Findable API
 * Findable Restful API Languages services
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

import { Inject, Injectable, Optional } from "@angular/core";
import { Http, Headers, URLSearchParams } from "@angular/http";
import {
  RequestMethod,
  RequestOptions,
  RequestOptionsArgs
} from "@angular/http";
import { Response } from "@angular/http";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import * as models from "../model/models";
import { environment } from "environments/environment";
import { Configuration } from "../configuration";

import { extendObj, handleResponse } from './utils.api';

/* tslint:disable:no-unused-variable member-ordering */

@Injectable()
export class LanguagesApi {
  protected basePath = environment.baseApiPath;
  public defaultHeaders: Headers = new Headers();
  public configuration: Configuration = new Configuration();
  private extendObj = extendObj;
  private handleResponse = handleResponse;

  constructor(
    protected http: Http,
    @Optional()
    @Inject(environment.baseApiPath)
    basePath: string,
    @Optional() configuration: Configuration
  ) {
    if (basePath) {
      this.basePath = basePath;
    }
    if (configuration) {
      this.configuration = configuration;
    }
  }
  
  /**
   * Get the user&#39;s languages
   *
   * @param userId The user identifier number
   */
  public usersUserIdLanguagesGet(
    userId: number,
    extraHttpRequestParams?: any
  ): Observable<models.Languages> {
    const path = this.basePath + `/users/${userId}/languages`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdLanguagesGet."
      );
    }

    // authentication (X-API-KEY) required
    if (this.configuration.apiKey) {
      headers.set("X-API-KEY", this.configuration.apiKey);
    }

    let requestOptions: RequestOptionsArgs = new RequestOptions({
      method: RequestMethod.Get,
      headers: headers,
      search: queryParameters
    });

    // https://github.com/swagger-api/swagger-codegen/issues/4037
    if (extraHttpRequestParams) {
      requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
    }

    return this.http.request(path, requestOptions).map(this.handleResponse);
  }

  /**
   * Delete a language from the user&#39;s profile
   *
   * @param userId The user identifier number
   * @param id The record identifier number
   */
  public usersUserIdLanguagesIdDelete(
    userId: number,
    id: number,
    extraHttpRequestParams?: any
  ): Observable<models.Success> {
    const path = this.basePath + `/users/${userId}/languages/${id}`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdLanguagesIdDelete."
      );
    }
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error(
        "Required parameter id was null or undefined when calling usersUserIdLanguagesIdDelete."
      );
    }

    // authentication (X-API-KEY) required
    if (this.configuration.apiKey) {
      headers.set("X-API-KEY", this.configuration.apiKey);
    }

    let requestOptions: RequestOptionsArgs = new RequestOptions({
      method: RequestMethod.Delete,
      headers: headers,
      search: queryParameters
    });

    // https://github.com/swagger-api/swagger-codegen/issues/4037
    if (extraHttpRequestParams) {
      requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
    }

    return this.http.request(path, requestOptions).map(this.handleResponse);
  }

  /**
   * Update a language from the user&#39;s profile
   *
   * @param userId The user identifier number
   * @param id The record identifier number
   * @param level
   */
  public usersUserIdLanguagesIdPut(
    userId: number,
    id: number,
    level: models.LanguageLevel,
    extraHttpRequestParams?: any
  ): Observable<models.Success> {
    const path = this.basePath + `/users/${userId}/languages/${id}`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdLanguagesIdPut."
      );
    }
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error(
        "Required parameter id was null or undefined when calling usersUserIdLanguagesIdPut."
      );
    }
    // verify required parameter 'level' is not null or undefined
    if (level === null || level === undefined) {
      throw new Error(
        "Required parameter level was null or undefined when calling usersUserIdLanguagesIdPut."
      );
    }

    // authentication (X-API-KEY) required
    if (this.configuration.apiKey) {
      headers.set("X-API-KEY", this.configuration.apiKey);
    }

    headers.set("Content-Type", "application/json");

    let requestOptions: RequestOptionsArgs = new RequestOptions({
      method: RequestMethod.Put,
      headers: headers,
      body: level == null ? "" : JSON.stringify(level), // https://github.com/angular/angular/issues/10612
      search: queryParameters
    });

    // https://github.com/swagger-api/swagger-codegen/issues/4037
    if (extraHttpRequestParams) {
      requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
    }

    return this.http.request(path, requestOptions).map(this.handleResponse);
  }

  /**
   * Add a new language to the user&#39;s profile
   *
   * @param userId The user identifier number
   * @param language
   */
  public usersUserIdLanguagesPost(
    userId: number,
    language: models.Language,
    extraHttpRequestParams?: any
  ): Observable<models.EntityId> {
    const path = this.basePath + `/users/${userId}/languages`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdLanguagesPost."
      );
    }
    // verify required parameter 'language' is not null or undefined
    if (language === null || language === undefined) {
      throw new Error(
        "Required parameter language was null or undefined when calling usersUserIdLanguagesPost."
      );
    }

    // authentication (X-API-KEY) required
    if (this.configuration.apiKey) {
      headers.set("X-API-KEY", this.configuration.apiKey);
    }

    headers.set("Content-Type", "application/json");

    let requestOptions: RequestOptionsArgs = new RequestOptions({
      method: RequestMethod.Post,
      headers: headers,
      body: language == null ? "" : JSON.stringify(language), // https://github.com/angular/angular/issues/10612
      search: queryParameters
    });

    // https://github.com/swagger-api/swagger-codegen/issues/4037
    if (extraHttpRequestParams) {
      requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
    }

    return this.http.request(path, requestOptions).map(this.handleResponse);
  }
  
}
