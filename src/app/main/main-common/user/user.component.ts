import { Component, OnInit } from "@angular/core";
import { DataService } from "../../../rest/service/data.service";
import { AuthService } from "../../../rest/service/auth.service";
import { AnalyticsService } from "../../../services/analytics.service";
import { PersonalDetails } from "../../../rest/model/PersonalDetails";

@Component({
  selector: "app-user-main",
  templateUrl: "user.component.html",
  styleUrls: ["user.component.css"],
})
export class UserComponent implements OnInit {
  menuVisible = false;

  profile: PersonalDetails = null;

  constructor(
    public dataService: DataService,
    public authService: AuthService,
    public analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.profile = this.authService.profile;

    if (!this.profile) {
      console.log("@user > onInit");
      this.dataService
        .profile_get_me(this.authService.getUserId())
        .subscribe((response) => {
          console.log("profile", response);
          this.profile = response;
          this.authService.update("profile", this.profile, "currentProfile");
        });
    }
  }

  logout(e: Event) {
    e.preventDefault();
    this.analyticsService.emitEvent(
      "Account",
      "Logout",
      "Desktop",
      this.authService.currentUser.user_id
    );
    this.authService.logout();
    //window.location.href = 'https://welcome.findable.co';
    window.location.href = window.location.origin + "/business/login";
  }
}
