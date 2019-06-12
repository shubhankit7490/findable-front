import { CompanySelectorComponent } from '../shared/company-selector/company-selector.component';

import { ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LogoComponent } from "./common/logo/logo.component";
import { HttpModule } from "@angular/http";
import { DatepickerModule } from "ng2-bootstrap";
import { AccordionModule } from "ng2-bootstrap";
import { TypeaheadModule } from "ng2-bootstrap";
import { DataService } from "../rest/service/data.service";
import { AuthService } from "../rest/service/auth.service";
import { TransformerService } from "../rest/service/transformer.service";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { appRoutes } from "../app.routes";
import { LoginComponent } from "./login/login.component";
import { SignupLayoutComponent } from "./layout/layout.component";
import { SignUpComponent } from "./signUp/signUp.component";
import { ModalModule } from "ng2-bootstrap";

import { VerifyComponent } from "./verify/verify.component";
import { PasswordForgotComponent } from "./passwordForgot/passwordForgot.component";
import { PasswordConfirmComponent } from "./passwordConfirm/passwordConfirm.component";
import { LogoutComponent } from './logout/logout.component';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    CommonModule,
    RouterModule.forChild(appRoutes),
    ModalModule,
    TypeaheadModule.forRoot(),
    DatepickerModule.forRoot(),
    AccordionModule.forRoot()
  ],
  declarations:[
    SignupLayoutComponent,
    LogoComponent,
    LoginComponent,
    SignUpComponent,
    VerifyComponent,
    PasswordForgotComponent,
    PasswordConfirmComponent,
    LogoutComponent,
    CompanySelectorComponent
  ],
  providers: [
    DataService,
    AuthService,
    TransformerService
  ],
  exports: [ SignupLayoutComponent ]

})
export class LoginModule {
}
