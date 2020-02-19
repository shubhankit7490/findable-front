import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-modal';
import { LogoComponent } from '../../main/main-common/logo/logo.component';
import { MenuComponent } from '../../main/main-common/menu/menu.component';
import { UserComponent } from '../../main/main-common/user/user.component';
import { AccountNumberComponent } from '../../main/main-common/account-number/account-number.component';
import { RouterModule }  from "@angular/router";
import { UploadResume } from   '../../business/upload-resume/upload-resume.component';
@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        ModalModule
    ],
    declarations: [
        LogoComponent,
        AccountNumberComponent,
        MenuComponent,
        UserComponent,
        UploadResume,
    ],
    exports: [
        LogoComponent,
        MenuComponent,
        AccountNumberComponent,
        UserComponent,
        UploadResume
    ]
})
export class HeaderModule {}
