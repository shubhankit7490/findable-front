import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogoComponent } from '../../main/main-common/logo/logo.component';
import { MenuComponent } from '../../main/main-common/menu/menu.component';
import { UserComponent } from '../../main/main-common/user/user.component';
import { RouterModule }                from "@angular/router";

@NgModule({
    imports: [
        RouterModule,
        CommonModule
    ],
    declarations: [
        LogoComponent,
        MenuComponent,
        UserComponent
    ],
    exports: [
        LogoComponent,
        MenuComponent,
        UserComponent
    ]
})
export class HeaderModule {}
