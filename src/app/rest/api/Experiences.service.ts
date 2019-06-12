/**
 * Findable API
 * Findable Restful API Experiencs services
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
import { Response, ResponseContentType } from "@angular/http";

import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

import * as models from "../model/models";
import { environment } from "environments/environment";
import { Configuration } from "../configuration";

/* tslint:disable:no-unused-variable member-ordering */

@Injectable()
export class ExperiencesApi {
  protected basePath = environment.baseApiPath;
  public defaultHeaders: Headers = new Headers();
  public configuration: Configuration = new Configuration();

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
   *
   * Extends object by coping non-existing properties.
   * @param objA object to be extended
   * @param objB source object
   */
  private extendObj<T1, T2>(objA: T1, objB: T2): T1 & T2 {
    for (let key in objB) {
      if (objB.hasOwnProperty(key)) {
        (<T1 & T2>objA)[key] = (<T1 & T2>objB)[key];
      }
    }
    return <T1 & T2>objA;
  }

  private handleResponse = (response: Response) => {
    if (response.status === 204) {
      return undefined;
    } else {
      return response.json();
    }
  };

  /**
   * Get the user&#39;s positions
   *
   * @param userId The user identifier number
   */
  public usersUserIdExperienceGet(
    userId: number,
    extraHttpRequestParams?: any
  ): Observable<models.Positions> {
    return this.usersUserIdExperienceGetWithHttpInfo(
      userId,
      extraHttpRequestParams
    ).map(this.handleResponse);
  }

  /**
   * Delete a user&#39;s position
   *
   * @param userId The user identifier number
   * @param id The record identifier number
   */
  public usersUserIdExperienceIdDelete(
    userId: number,
    id: number,
    extraHttpRequestParams?: any
  ): Observable<Response> {
    return this.usersUserIdExperienceIdDeleteWithHttpInfo(
      userId,
      id,
      extraHttpRequestParams
    ).map(this.handleResponse);
  }

  /**
   * Update one of the positions
   *
   * @param userId The user identifier number
   * @param id The record identifier number
   * @param position
   */
  public usersUserIdExperienceIdPut(
    userId: number,
    id: number,
    position: models.Position,
    extraHttpRequestParams?: any
  ): Observable<Response> {
    return this.usersUserIdExperienceIdPutWithHttpInfo(
      userId,
      id,
      position,
      extraHttpRequestParams
    ).map(this.handleResponse);
  }

  /**
   * Add a new position
   *
   * @param userId The user identifier number
   * @param position
   */
  public usersUserIdExperiencePost(
    userId: number,
    position: models.Position,
    extraHttpRequestParams?: any
  ): Observable<models.EntityId> {
    return this.usersUserIdExperiencePostWithHttpInfo(
      userId,
      position,
      extraHttpRequestParams
    ).map(this.handleResponse);
  }

  /**
   * Get the user&#39;s positions
   *
   * @param userId The user identifier number
   */
  public usersUserIdExperienceGetWithHttpInfo(
    userId: number,
    extraHttpRequestParams?: any
  ): Observable<Response> {
    const path = this.basePath + `/users/${userId}/experience`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdExperienceGet."
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

    return this.http.request(path, requestOptions);
  }

  /**
   * Delete a user&#39;s position
   *
   * @param userId The user identifier number
   * @param id The record identifier number
   */
  public usersUserIdExperienceIdDeleteWithHttpInfo(
    userId: number,
    id: number,
    extraHttpRequestParams?: any
  ): Observable<Response> {
    const path = this.basePath + `/users/${userId}/experience/${id}`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdExperienceIdDelete."
      );
    }
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error(
        "Required parameter id was null or undefined when calling usersUserIdExperienceIdDelete."
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

    return this.http.request(path, requestOptions);
  }

  /**
   * Update one of the positions
   *
   * @param userId The user identifier number
   * @param id The record identifier number
   * @param position
   */
  public usersUserIdExperienceIdPutWithHttpInfo(
    userId: number,
    id: number,
    position: models.Position,
    extraHttpRequestParams?: any
  ): Observable<Response> {
    const path = this.basePath + `/users/${userId}/experience/${id}`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdExperienceIdPut."
      );
    }
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error(
        "Required parameter id was null or undefined when calling usersUserIdExperienceIdPut."
      );
    }
    // verify required parameter 'position' is not null or undefined
    if (position === null || position === undefined) {
      throw new Error(
        "Required parameter position was null or undefined when calling usersUserIdExperienceIdPut."
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
      body: position == null ? "" : JSON.stringify(position), // https://github.com/angular/angular/issues/10612
      search: queryParameters
    });

    // https://github.com/swagger-api/swagger-codegen/issues/4037
    if (extraHttpRequestParams) {
      requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
    }

    return this.http.request(path, requestOptions);
  }

  /**
   * Add a new position
   *
   * @param userId The user identifier number
   * @param position
   */
  public usersUserIdExperiencePostWithHttpInfo(
    userId: number,
    position: models.Position,
    extraHttpRequestParams?: any
  ): Observable<Response> {
    const path = this.basePath + `/users/${userId}/experience`;

    let queryParameters = new URLSearchParams();
    let headers = new Headers(this.defaultHeaders.toJSON()); // https://github.com/angular/angular/issues/6845
    // verify required parameter 'userId' is not null or undefined
    if (userId === null || userId === undefined) {
      throw new Error(
        "Required parameter userId was null or undefined when calling usersUserIdExperiencePost."
      );
    }
    // verify required parameter 'position' is not null or undefined
    if (position === null || position === undefined) {
      throw new Error(
        "Required parameter position was null or undefined when calling usersUserIdExperiencePost."
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
      body: position == null ? "" : JSON.stringify(position), // https://github.com/angular/angular/issues/10612
      search: queryParameters
    });

    // https://github.com/swagger-api/swagger-codegen/issues/4037
    if (extraHttpRequestParams) {
      requestOptions = this.extendObj(requestOptions, extraHttpRequestParams);
    }

    return this.http.request(path, requestOptions);
  }

}