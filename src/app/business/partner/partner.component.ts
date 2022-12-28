import {
  Component,
  OnInit,
  ViewChild,
  Output,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ElementRef,
  EventEmitter,
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Location } from "@angular/common";
import { Subscription, Observable } from "rxjs";
import { DataTable } from "interjet-primeng/components/datatable/datatable";

// models
import * as models from "../../rest/model/models";
import { Modal } from "ngx-modal";
// Services
import { DataService } from "../../rest/service/data.service";
import { AuthService } from "../../rest/service/auth.service";
import { GrowlService } from "../../rest/service/growl.service";
import { MessageService } from "../../services/message.service";
import { AnalyticsService } from "../../services/analytics.service";
import { ChartDataService } from "../../services/chart-data.service";

import { UserPreferencesExt } from "../../rest/service/extended-models/UserPreferencesExt";
// components
import {
  OnPurchaseData,
  PurchaseApplicantComponent,
} from "../../shared/purchase-applicant/purchase-applicant.component";
import {
  EmitArraySelector,
  ArraySelectorComponent,
} from "../../shared/array-selector/array-selector.component";
import {
  RatingSliderComponent,
  RatedItem,
} from "../../shared/rating-slider/rating-slider.component";
import { NoteComponent } from "../../shared/note/note.component";
import { PartnerFormComponent } from "../../form/partner-form/partner-form.component";
import { TourService } from "../../services/tour.service";
import * as JSZip from "jszip";
import { saveAs } from "file-saver";
import * as es6printJS from "print-js";
import { LocationExt } from "app/rest/service/extended-models/LocationExt";
import { LocationsExt } from "app/rest/service/extended-models/LocationsExt";
import {
  BusinessPartner,
  BusinessPartnerRequest,
  BusinessPartnerSearchResult,
} from "../../rest/model/models";
declare let JSZipUtils: any;
@Component({
  selector: "business-partner",
  templateUrl: "partner.component.html",
  styleUrls: ["partner.component.css"],
})
export class PartnerComponent implements OnInit, AfterViewInit {
  @ViewChild("table") table: DataTable;
  @ViewChild("actionSelector") actionSelector: ArraySelectorComponent;
  @ViewChild("jobTitleComponent") jobTitleComponent;

  @ViewChild("partnerModal") partnerModal: Modal;
  @ViewChild("partnerModalForm")
  partnerModalForm: PartnerFormComponent;

  @ViewChildren(PartnerFormComponent)
  partnerFormComponent: QueryList<PartnerFormComponent>;

  public selectedLocations: LocationsExt = null;
  private locationClear: LocationExt;
  public enums: models.Enums;
  public selectedPartners = [];
  public results: models.BusinessPartnerSearchResponse = {};
  public total: number;
  public currentResultsCount = 0;

  // Job title
  public selectedJobTitles: models.JobTitle[] = [];

  public company: models.Company = null;

  public isEdit = null;

  // Search functionality
  public offset = 0;
  public orderby = "Name";
  public order = "asc";
  public loadingResults: boolean = false;
  public resettingSearch: boolean = false;

  public searchModel: models.BusinessPartner = {
    jobTitles: [],
    location: {
      continent_id: null,
      continent_name: "",
      city_id: null,
      city_name: "",
      state_id: null,
      state_name: "",
      country_id: null,
      country_name: "",
      country_short_name_alpha_3: "",
      country_short_name_alpha_2: "",
    },
    company_id: null,
    userId: null,
  };

  // Temporary data holder
  private tmpJobTitle = "";
  private tmpCompany = "";

  public jobTitleQuery: string = "";
  role: string = "";

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private chartDataService: ChartDataService,
    private messageService: MessageService,
    private location: Location,
    private analyticsService: AnalyticsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    public tourService: TourService
  ) {
    this.role = this.authService.currentUser.role;
    this.searchModel.userId = this.authService.currentUser.user_id;
  }

  ngOnInit() {
    this.performSearch();
    this.analyticsService.emitPageview("Partners");
  }

  public handleResetButton() {
    this.resettingSearch = true;

    this.searchModel = {
      jobTitles: [],
      location: {
        continent_id: null,
        continent_name: "",
        city_id: null,
        city_name: "",
        state_id: null,
        state_name: "",
        country_id: null,
        country_name: "",
        country_short_name_alpha_3: "",
        country_short_name_alpha_2: "",
      },
      company_id: null,
      userId: null,
    };
    this.selectedJobTitles = [];
    this.company = { id: null, name: "" };

    // Hard reset (Jobtitle)
    this.jobTitleQuery = "";
    this.tmpJobTitle = "";
    this.selectedJobTitles = [];
    this.jobTitleComponent.tagInput.autocompleteElement.input.value = "";

    this.performSearch(true);
  }

  public onSubmit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.performSearch(true);
  }

  private parseJobTitles(data: models.DictionaryItem[]) {
    if (!data) {
      this.selectedJobTitles = [];
    } else {
      this.selectedJobTitles = data.filter((JobTitle) => {
        return JobTitle["id"] !== null;
      });

      let JobTitlesFreeText = data.filter((JobTitle) => {
        return JobTitle["id"] === null;
      });

      if (JobTitlesFreeText.length > 0) {
        this.jobTitleQuery = JobTitlesFreeText[0]["name"];
      }
    }

    this.onJobTitleChange();
  }

  /**
   * Job Title - on job title selection
   */
  public onJobTitleChange(jobTitle?: models.JobTitle) {
    this.tmpJobTitle = "";
    this.searchModel.jobTitles = this.selectedJobTitles.map(
      (value, index) => value
    );
  }

  public onJobTitleUpdate(event: Event) {
    this.tmpJobTitle = (event.srcElement as HTMLInputElement).value;
  }

  /**
   * Job Title - on job title removal
   */
  public onJobTitleRemove(id: number) {
    this.selectedJobTitles = this.selectedJobTitles.filter((value) => {
      return Number(id) !== Number(value.id);
    });

    this.searchModel.jobTitles = this.selectedJobTitles
      .filter((value) => {
        return Number(id) !== Number(value.id);
      })
      .map((value) => {
        return value;
      });

    this.performSearch();
  }

  /**
   * On location selection
   */
  public onLocationSelected(location: models.Location) {
    this.searchModel.location = location;
  }

  /**
   * Experience - on company name selection
   */
  public onCompanyNameSelected(event) {
    this.tmpCompany = "";
    this.searchModel.company_id = event.item;
  }

  public onCompanyNameChange(event) {
    this.tmpCompany = (event.item.srcElement as HTMLInputElement).value;
  }

  public onSortTypeSelected(type: string) {
    this.order = "asc";
    this.orderby = type;
    this.performSearch();
  }

  public onOrderTypeSelected(type: string) {
    this.order = type;
    this.performSearch();
  }

  public loadData(event) {
    this.offset = event.first;

    this.performSearch();
  }

  public performSearch(resetOffset = false) {
    this.prependData();

    this.loadingResults = true;

    if (resetOffset && this.currentResultsCount > 0) {
      this.offset = 0;

      // When the search model is updated, resetting the table should trigger the OnLazyLoad event
      this.table.reset();
      this.resettingSearch = false;
    } else {
      let userId = this.authService.currentUser.user_id;
      this.dataService
        .getPartners(
          userId,
          this.offset,
          this.orderby,
          this.order,
          this.searchModel
        )
        .subscribe(
          (response: models.BusinessPartnerSearchResponse) => {
            this.analyticsService.emitEvent(
              "Partner",
              "Partner",
              "Desktop",
              this.authService.currentUser.user_id
            );
            // // console.log('@search performSearch results:', response);
            this.results = response;
            this.total = response.total;
            this.currentResultsCount = response.result.length;

            this.loadingResults = false;
            this.resettingSearch = false;
            if (!response.token) {
              this.location.replaceState(
                `/business/partners?token=${this.authService.currentUser.key}`
              );
            } else {
              this.location.replaceState(
                `/business/partners?token=${response.token}`
              );
            }
          },
          (error) => {
            this.loadingResults = false;
            this.resettingSearch = false;
            GrowlService.message(JSON.parse(error._body).message, "error");
          }
        );

      // this.loadingResults = false;
      // this.resettingSearch = false;
    }
  }

  /**
   * Event to be fired on table row click
   */
  public onRowClick(event) {
    if (event.originalEvent.target.className != "glyphicon glyphicon-edit") {
      this.analyticsService.emitEvent(
        "Partner",
        "Open",
        "Desktop",
        this.authService.currentUser.user_id
      );
      this.toggleCurrentRow(event);
    }
  }

  private toggleCurrentRow(event) {
    let row_id = Number(event.data.id);

    this.table.toggleRow(event.data, event.originalEvent);

    setTimeout(() => {
      this.table.selection = this.table.expandedRows;
    }, 0);
  }

  private getEnums() {
    this.dataService.dictionary_enums().subscribe((response) => {
      this.enums = response;
    });
  }

  /**
   * format number to a human readable number with a separator
   * @param {number} number applicant salary
   * @param {string} sep number separator
   */
  formatNumber(value, sep) {
    if (!sep) {
      sep = ",";
    }
    if (!value && value !== 0) {
      return;
    }
    if (value.toString() === value.toLocaleString()) {
      let parts = value.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      value = parts[1] ? parts.join(".") : parts[0];
    } else {
      value = value.toLocaleString();
    }

    return value;
  }

  getRowClass(data, index) {
    let className = "fnd-search-row";

    if (!!data.firstname || !!data.lastname) {
      className += " applicant-row-purchased";
    }

    return className;
  }

  OnDestroy() {}

  public prependData() {
    let found = 0;
    if (this.tmpJobTitle.length > 0) {
      if (this.searchModel.jobTitles === null) {
        this.searchModel.jobTitles = [
          {
            id: null,
            name: this.tmpJobTitle,
          },
        ];
      } else {
        found = this.searchModel.jobTitles.filter((item) => {
          return item.name === this.tmpJobTitle;
        }).length;
        if (!found) {
          this.searchModel.jobTitles.push({
            id: null,
            name: this.tmpJobTitle,
          });
        }
      }
    }

    if (this.tmpCompany.length > 0) {
      this.searchModel.company_id = {
        id: null,
        name: this.tmpCompany,
      };
    }
  }

  /**
   * @private .
   * @abstract .
   * @param {string} model
   * @param {string} arr
   *
   * Pushes a new item into an array with id defaulted to null
   * and a name given from a returned function.
   * @returns {Function}
   */
  private unfoundPushToSearchModelprop(arr: string): Function {
    return (name: string) => {
      this.searchModel[arr].push({ id: null, name });
    };
  }

  // display ad after view render
  ngAfterViewInit() {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML =
      "googletag.cmd.push(function() { googletag.display('div-gpt-ad-1546199654905-0'); });";
    const __this = this;
    s.onload = function () {
      __this.afterScriptAdded();
    };
    document.getElementById("div-gpt-ad-1546199654905-0").appendChild(s);
  }

  afterScriptAdded() {
    const params = {};
    if (typeof window["functionFromExternalScript"] === "function") {
      window["functionFromExternalScript"](params);
    }
  }

  actionOnOpen() {
    this.analyticsService.emitEvent(
      "Status And Preferences",
      "Open",
      "Desktop",
      this.authService.currentUser.user_id
    );
  }

  actionOnClose() {
   let partnerDetail:BusinessPartnerSearchResult = {
      id: "",
      created_by: "",
      name: "",
      mobile_numbar: "",
      email: "",
      company: "",
      job_title: "",
      country: "",
      state: "",
      city_id: "",
      industry: "",
      tags: "",
      status: "",
      comment: "",
      deleted: "",
      created: "",
      updated: "",
      continent_id: "",
      continent_name: "",
      country_id: "",
      country_name: "",
      country_short_name_alpha_2: "",
      country_short_name_alpha_3: "",
      state_id: "",
      state_name: "",
      state_short_name: "",
      city_name: ""
    };
    this.dataService.setSelectedPartnerDetail(partnerDetail);
    this.partnerModal.close();
  }

  actionOnSubmit() {
    this.partnerModal.close();
  }

  closeStatusModal(e) {
    this.partnerModal.close();
    this.performSearch(true);
  }

  update_status(e) {
    this.performSearch(true);
  }

  openPartnerModel(isEdit:boolean, partnerDetail: BusinessPartnerSearchResult = null) {
    this.isEdit = isEdit;
    if (isEdit) {
      this.dataService.setSelectedPartnerDetail(partnerDetail);
    } else {
      partnerDetail = {
        id: "",
        created_by: "",
        name: "",
        mobile_numbar: "",
        email: "",
        company: "",
        job_title: "",
        country: "",
        state: "",
        city_id: "",
        industry: "",
        tags: "",
        status: "",
        comment: "",
        deleted: "",
        created: "",
        updated: "",
        continent_id: "",
        continent_name: "",
        country_id: "",
        country_name: "",
        country_short_name_alpha_2: "",
        country_short_name_alpha_3: "",
        state_id: "",
        state_name: "",
        state_short_name: "",
        city_name: ""
      };
      this.dataService.setSelectedPartnerDetail(partnerDetail);
    }
    this.partnerModal.open();
  }
}
