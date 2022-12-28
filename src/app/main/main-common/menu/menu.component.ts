import { Component, OnInit } from "@angular/core";
import { TourService } from "../../../services/tour.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-menu-main",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"],
  inputs: ["role"],
})
export class MenuComponent implements OnInit {
  private _role: string;
  public _conf: MenuConfig;
  public _route: string;
  private menuConf: MenuConfig = {
    applicant: [
      /*{
				text: 'Home',
				url: '/',
				id: 'menu-applicant-home'
			},*/
      {
        text: "FAQ",
        url: "/faq",
        id: "menu-applicant-faq",
      },
      /*{
				text: 'Block Companies',
				url: '/user/block',
				id: 'menu-applicant-block-companies'
			},*/
      {
        text: "Job Board",
        url: "https://findable.jobboard.io",
        id: "menu-applicant-job-board",
        opennew: true,
        outsideurl: true,
      },
    ],
    manager: [
      {
        text: "Search",
        url: "/business/search",
        reloaded: true,
        id: "menu-manager-search",
      },
      {
        text: "Account Settings",
        url: "/business/account/info",
        id: "menu-manager-account-settings",
      },
      /*{
				text: 'Applicants Stats',
				url: '/business/stats',
				id: 'menu-manager-applicants-stats'
			},*/
      {
        text: "Help",
        url: "/faq",
        id: "menu-manager-faq",
      },
      {
        text: "Component",
        iscomponent: true,
      },
    ],
    recruiter: [
      {
        text: "Search",
        url: "/business/search",
        reloaded: true,
        id: "menu-recruiter-search",
      },
      {
        text: "Account Settings",
        url: "/business/account/info",
        id: "menu-recruiter-account-settings",
      },
      /*{
				text: 'Applicants Stats',
				url: '/business/stats',
				id: 'menu-recruiter-applicants-stats'
			},*/
      {
        text: "Help",
        url: "/faq",
        id: "menu-recruiter-faq",
      },
      {
        text: "Component",
        iscomponent: true,
      },
    ],
  };

  constructor(private router: Router, private tourService: TourService) {
    this._route = router.url;
  }

  set role(role) {
    this._role = role;
    this._conf = this.menuConf[role];
  }

  ngOnInit() {
    console.log(this._role);
  }

  public initTourSection(event: Event) {
    this.tourService.initSection(event);
  }

  goto(link: string) {
    // this.router.navigate(["/"], { skipLocationChange: true }).then(() => {
    //   this.router.navigate([link]);
    // });

    this.router.navigate([link]);
  }
}

export interface MenuConfig {
  applicant: MenuConfigItem[];
  recruiter: MenuConfigItem[];
  manager: MenuConfigItem[];
}

interface MenuConfigItem {
  text?: string;
  url?: string;
  reloaded?: boolean;
  id?: string;
  opennew?: boolean;
  outsideurl?: boolean;
  iscomponent?: boolean;
}
