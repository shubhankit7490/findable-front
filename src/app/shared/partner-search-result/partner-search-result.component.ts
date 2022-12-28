import { Component, Input, OnInit } from "@angular/core";
import { BusinessPartnerSearchResult } from "app/rest/model/BusinessPartnerSearchResult";

@Component({
  selector: "app-partner-search-result",
  templateUrl: "./partner-search-result.component.html",
  styleUrls: ["./partner-search-result.component.css"],
})
export class PartnerSearchResultComponent implements OnInit {
  @Input() partnerDetail: any = {};
  constructor() {}

  ngOnInit() {}
}
