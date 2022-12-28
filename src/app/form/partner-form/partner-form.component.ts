import {
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "app/rest/service/auth.service";
import { DataService } from "app/rest/service/data.service";
import { AnalyticsService } from "app/services/analytics.service";
import { MessageService } from "app/services/message.service";
import { AutoComplete } from "interjet-primeng/components/autocomplete/autocomplete";
import { Observable } from "rxjs";
import * as models from "../../rest/model/models";
import { LocationsFormComponent } from "../locations-form/locations-form.component";
import * as extModels from "../../rest/service/extended-models/extended-models";
import { GrowlService } from "app/rest/service/growl.service";
import {
  BusinessPartnerRequest,
  BusinessPartnerSearchResult,
  BusinessPartnerUpdateRequest,
  Companies,
  Company,
  Locations,
} from "../../rest/model/models";
import { LocationExt } from "../../rest/service/extended-models/extended-models";

@Component({
  selector: "app-partner-form",
  templateUrl: "./partner-form.component.html",
  styleUrls: ["./partner-form.component.css"],
})
export class PartnerFormComponent implements OnInit {
  @ViewChild("jobTitle") jobTitleInput: AutoComplete;

  public requestingJobTitle = false;
  public previous_status: Boolean = false;
  public resultsJobTitle: models.DictionaryItem[];
  private setModelJobTitle: models.JobTitle = {
    id: null,
    name: "",
  };

  public searchTermJobTitle: string;
  @ViewChild("locationComponent")
  locationComponent: LocationsFormComponent;

  isSubmitted: boolean = false;
  tags: string[] = [];

  // locations: Array<models.Location> = null;

  location: extModels.LocationExt = null;
  industry: models.Industry = null;
  @Input() isEdit: string = null;
  @Input() company: models.Company = { id: null, name: "" };
  private tmpCompany = "";
  public companies: Company[];

  public formErrors: FormErrors = {
    name: "",
    number: "",
    email: "",
    jobTitle: "",
    company: "",
    location: "",
    tags: "",
    comment: "",
    industry: "",
  };

  public partnerForm: FormGroup;

  @Output() onSuccessfulUpdate = new EventEmitter<any>();

  // Places API
  public autoCompleteGoogle: google.maps.places.Autocomplete = null;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {
    this.company = { id: 0, name: "" };
  }

  ngOnInit() {
    this.companies = [];

    // Mobile Number pattern: Validators.pattern("^([0]|\\+91)?[789]\\d{9}$")
    this.partnerForm = this.formBuilder.group({
      id: [0],
      name: ["", [Validators.required]],
      number: ["", [Validators.required]],
      email: [
        "",
        [
          Validators.required,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
        ],
      ],
      location: ["", [Validators.required]],
      jobTitle: ["", [Validators.required]],
      company: ["", [Validators.required]],
      industry: [""],
      comment: [""],
      tags: [""],
    });

    this.dataService
      .getSelectedPartnerDetail()
      .subscribe((res: BusinessPartnerSearchResult) => {
        let selectedPartner = res;

        if (selectedPartner.tags) {
          this.tags = selectedPartner.tags.split(",");
        } else {
          this.tags = [];
        }

        let modifiedLocation = "";
        if (selectedPartner.city_name) {
          modifiedLocation = `${selectedPartner.city_name}, `;
          modifiedLocation += selectedPartner.state_short_name
            ? `${selectedPartner.state_short_name}, `
            : "";
          modifiedLocation += `${selectedPartner.country_name}`;
        }

        this.partnerForm = this.formBuilder.group({
          id: [selectedPartner.id],
          name: [selectedPartner.name, [Validators.required]],
          number: [
            selectedPartner.mobile_numbar,
            [
              Validators.required,
              Validators.pattern("^([0]|\\+91)?[789]\\d{9}$"),
            ],
          ],
          email: [
            selectedPartner.email,
            [
              Validators.required,
              Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
            ],
          ],
          location: [modifiedLocation, [Validators.required]],
          jobTitle: [selectedPartner.job_title, [Validators.required]],
          company: [selectedPartner.company, [Validators.required]],
          industry: [selectedPartner.industry],
          comment: [selectedPartner.comment],
          tags: [selectedPartner.tags],
        });
      });

    let domLooker = setInterval(() => {
      if (!!document.getElementById("city")) {
        this.loadGmaps();
        clearInterval(domLooker);
      }
    }, 50);
  }

  /** Google Maps Autocomplete loader method
   * Initially used in ngOnInit if #city exists in document.
   * @private .
   *
   * Triggered by a 20ms timeout. Google Maps finds #city in DOM and
   * adds a dom listener by same id and listens to every keydown.
   * A 'place_changed' listener is also added and binds func getAutoCompleteLocation.
   * @returns {void} void
   */
  private loadGmaps(): void {
    setTimeout(() => {
      /*this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('city')), { types: ['(cities)'] });*/
      let element = <HTMLInputElement>document.getElementById("city");
      this.autoCompleteGoogle = new google.maps.places.Autocomplete(element);
      google.maps.event.addDomListener(
        document.getElementById("city"),
        "keydown",
        function (event) {
          if (event.keyCode === 13) {
            // prevent enter and return keys
            event.preventDefault();
          }
        }
      );
      this.autoCompleteGoogle.addListener(
        "place_changed",
        this.getAutoCompleteLocation.bind(this)
      );
    }, 20);
  }

  /** Use loadGmaps to receive autocomplete place & fill
   * Class var companyLocation with location data.
   * @private .
   *
   * Once the received location data has a geometry property,
   * loop over the address components and assign received data
   * to companyLocation properties.
   * @requires city_name
   * @requires country_name
   * @returns {void} void
   */
  private getAutoCompleteLocation(): void {
    let place = this.autoCompleteGoogle.getPlace();
    if (!place.geometry) {
      return;
    }

    this.location = {
      name: null,
      continent_id: null,
      continent_name: null,
      city_id: null,
      city_name: null,
      state_id: null,
      state_name: null,
      state_short_name: null,
      country_id: null,
      country_name: null,
      country_short_name_alpha_2: null,
      country_short_name_alpha_3: null,
    };

    for (let i = 0; i < place.address_components.length; i++) {
      let addressType = place.address_components[i].types[0];
      switch (addressType) {
        case "country":
          this.location.country_name = place.address_components[i]["long_name"];
          this.location.country_short_name_alpha_2 =
            place.address_components[i]["short_name"];
          break;
        case "locality":
          this.location.city_name = place.address_components[i]["long_name"];
          break;
        case "postal_town":
          if (this.location.city_name === null) {
            this.location.city_name = place.address_components[i]["long_name"];
          }
          break;
        case "administrative_area_level_1":
          if (this.location.city_name === null) {
            this.location.city_name = place.address_components[i]["long_name"];
          }
          this.location.state_name = place.address_components[i]["long_name"];
          this.location.state_short_name =
            place.address_components[i]["short_name"];
          break;
        case "administrative_area_level_2":
          if (this.location.state_name === null) {
            this.location.state_name = place.address_components[i]["long_name"];
            this.location.state_short_name =
              place.address_components[i]["short_name"];
          }
          break;
      }
    }

    /** Display string for location input */
    let location = `${this.location.city_name}, `;
    location += this.location.state_short_name
      ? `${this.location.state_short_name}, `
      : "";
    location += `${this.location.country_name}`;

    this.partnerForm.patchValue({ location: location });
  }

  UpdateJobTitleState(event) {
    let _e = event.srcElement || event.target;

    if (_e.value.length > 0) {
      this.partnerForm.controls["jobTitle"].markAsDirty();
    } else {
      this.partnerForm.patchValue({
        jobTitle: "",
      });
    }
  }

  searchJobTitle(event) {
    this.setModelJobTitle = {
      id: null,
      name: event.query,
    };

    if (!event.query.length) {
      return;
    }

    this.requestingJobTitle = true;
    this.dataService
      .dictionary_job_title_get("jobTitle", event.query)
      .subscribe((response) => {
        this.resultsJobTitle = response;
        this.requestingJobTitle = false;
      });
  }

  validateJobTitle(element) {
    setTimeout(
      function () {
        this.jobTitleInput.hide();
      }.bind(this),
      200
    );

    this.partnerForm.patchValue({
      jobTitle: (<HTMLInputElement>element.target).value,
    });

    this.setModelJobTitle = {
      id: null,
      name: (<HTMLInputElement>element.target).value,
    };

    if (!(<HTMLInputElement>element.target).value) {
      this.formErrors["job_title"] = "Please type or choose a job title";
    } else {
      this.formErrors["job_title"] = "";
    }
  }

  onSelectJobTitleAutoComplete(e) {
    console.log("form", this.partnerForm.value);
    this.partnerForm.patchValue({
      jobTitle: e.name,
    });
    this.setModelJobTitle = e;
    this.formErrors["job_title"] = "";
  }

  public onCompanyNameChange(event) {
    this.tmpCompany = (event.item.srcElement as HTMLInputElement).value;
    if (!this.tmpCompany) {
      this.formErrors.company = "Company name is required";
    } else {
      this.formErrors.company = "";
      this.partnerForm.patchValue({
        company: this.tmpCompany,
      });

      this.partnerForm.updateValueAndValidity();
    }
  }

  public onCompanyNameSelected(event) {
    this.tmpCompany = "";
    this.partnerForm.patchValue({
      company: event.item.name,
    });
  }

  onLocationChange(event) {
    let tmpLocation = event.target.value;
    if (!tmpLocation) {
      this.formErrors.location = "Location is required";
    } else {
      this.formErrors.location = "";
      this.partnerForm.patchValue({
        location: tmpLocation,
      });

      this.partnerForm.updateValueAndValidity();
    }
  }

  public onLocationSelected(location: models.Location) {
    this.analyticsService.emitEvent(
      "Partner",
      "Location Selected",
      "Desktop",
      this.authService.currentUser.user_id
    );

    this.partnerForm.patchValue({
      location: location,
    });

    this.partnerForm.updateValueAndValidity();
  }

  onIndustryChange(event) {
    let tmpIndustry = event.target.value;
    if (!tmpIndustry) {
      this.formErrors.industry = "Industry is required";
    } else {
      this.formErrors.industry = "";
      this.partnerForm.patchValue({
        industry: tmpIndustry,
      });

      this.partnerForm.updateValueAndValidity();
    }
  }

  public onIndustrySelected(industry: models.Industry) {
    debugger;
    this.analyticsService.emitEvent(
      "Partner",
      "Industry Selected",
      "Desktop",
      this.authService.currentUser.user_id
    );

    this.partnerForm.patchValue({
      industry: industry.name,
    });

    this.partnerForm.updateValueAndValidity();
  }

  onPartnerSubmit(event) {
    if (this.isEdit) {
      let partnerId = this.partnerForm.get("id").value;
      let request: BusinessPartnerUpdateRequest = {
        tags: this.partnerForm.get("tags").value,
        comment: this.partnerForm.get("comment").value,
        industry: this.partnerForm.get("industry").value,
        name: this.partnerForm.get("name").value,
        email: this.partnerForm.get("email").value,
        mobile_numbar: this.partnerForm.get("number").value,
        company: this.partnerForm.get("company").value,
        job_title: this.partnerForm.get("jobTitle").value,
        location: this.location,
      };
      this.dataService.updatePartner(partnerId, request).subscribe(
        (response: any) => {
          if (response.status) {
            GrowlService.message("Partner updated successfully!", "success");
            this.tags = [];
            this.partnerForm.reset();
            this.onSuccessfulUpdate.emit(response);
          } else {
            GrowlService.message(
              "Error occurred while updating the partner!",
              "error"
            );
          }
        },
        (err) => {
          GrowlService.message("Some error occurred", "error");
          console.error("Error occurred", err);
        }
      );
    } else {
      if (this.partnerForm.valid) {
        let request: BusinessPartnerRequest = {
          name: this.partnerForm.get("name").value,
          email: this.partnerForm.get("email").value,
          mobile_numbar: this.partnerForm.get("number").value,
          company: this.partnerForm.get("company").value,
          job_title: this.partnerForm.get("jobTitle").value,
          location: this.location,
          tags: this.partnerForm.get("tags").value,
        };
        this.dataService
          .savePartner(this.authService.currentUser.user_id, request)
          .subscribe(
            (response: any) => {
              if (response.status) {
                GrowlService.message("Partner saved successfully!", "success");
                this.tags = [];
                this.partnerForm.reset();
                this.onSuccessfulUpdate.emit(response);
              } else {
                GrowlService.message(
                  "Error occurred while saving the partner!",
                  "error"
                );
              }
            },
            (err) => {
              GrowlService.message("Some error occurred", "error");
              console.error("Error occurred", err);
            }
          );
      } else {
        GrowlService.message("Please fill the mandatory field", "error");
      }
    }
  }

  onTagKeydown(event) {
    event.preventDefault();

    let tag = event.target.value;
    if (tag) {
      this.tags.push(tag);
      event.target.value = "";
      this.partnerForm.patchValue({
        tags: this.tags.join(","),
      });
      this.partnerForm.updateValueAndValidity();
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.partnerForm.patchValue({
      tags: this.tags.join(","),
    });
    this.partnerForm.updateValueAndValidity();
  }

  // onLocationsChange(locations: models.Location[]) {
  //   this.locations = locations;
  //   this.partnerForm.controls["location"].markAsDirty();
  // }
}

export interface FormErrors {
  jobTitle: string;
  name: string;
  number: string;
  email: string;
  company: string;
  location: string;
  tags: string;
  comment: string;
  industry: string;
}
