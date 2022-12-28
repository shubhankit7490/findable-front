import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
} from "@angular/core";
import { Subscription } from "rxjs/Subscription";

// services:
import { DataService } from "../../rest/service/data.service";

// models:
import * as models from "../../rest/model/models";

import { AutoComplete } from "interjet-primeng/components/autocomplete/autocomplete";

@Component({
  selector: "app-industry-form",
  templateUrl: "./industry-form.component.html",
  styleUrls: ["./industry-form.component.css"],
})
export class IndustryFormComponent implements OnInit {
  @ViewChild("autoCompleteIndustry") autocompleteElement: AutoComplete;

  @Input() industry: models.Industry;

  @Output() onSelected = new EventEmitter<models.Industry>();
  @Output() onBlur = new EventEmitter<models.Industry>();

  public industries: models.Industry[];
  public requestingIndustry: boolean = false;
  public searchTerm: string = "";

  private industryDictionary$: Subscription;

  constructor(public dataService: DataService) {}

  ngOnInit() {}

  /** Search Industry handler
   * @public
   * @param {Event} event receives an object with a query property
   *
   * IF query is empty short circuit.
   * Assign class var industry name property with query value.
   * Start input search spinner.
   * Subscribe to data service and GET industry dictionary.
   * Assign received dictionary to Class var industries & stop spinner.
   * @returns {void} void
   */
  public searchIndustry(event): void {
    // stop if length === 0
    if (!event.query.length) {
      return;
    }
    this.industry = {
      id: null,
      name: event.query,
    };

    // start spinner:
    this.requestingIndustry = true;

    this.industryDictionary$ = this.dataService
      .dictionary_industry_get("industry", event.query)
      .subscribe(
        (response: models.Industry[]) => {
          this.industries = response;
          // stop spinner:
          this.requestingIndustry = false;
        },
        (error) => {
          console.log("@setup-form > searchIndustry [ERROR]", error);
          this.requestingIndustry = false;
        }
      );
  }

  /** Industry input on select handler
   * @public
   * @param {Industry} industry industry object
   *
   * Setting class var industry with selected industry object.
   * patching industry value on partnerForm with name of industry.
   * Setting businessModel['industry'] with selected industry object.
   * @returns {void} void
   */
  public onSelectIndustry(industry: models.Industry): void {
    this.setIndustryText(industry.name);
    this.industry = industry;
    this.onSelected.emit(industry);
  }

  public setState(event: Event) {
    this.onSelected.emit({ id: null, name: null });
  }

  public onFocusOut(industry: models.Industry) {
    this.industry = industry;
    this.onBlur.emit(industry);
  }

  private setIndustryText(text: string) {
    this.autocompleteElement.el.nativeElement.querySelector("input").value =
      text ? text : "";
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      if ("industry" in changes) {
        if (changes["industry"].currentValue !== null) {
          this.setIndustryText(this.industry.name);
        } else {
          this.setIndustryText("");
        }
      }
    }, 0);
  }
}
