import { AuthService } from '../rest/service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
declare let Interjet: any;

@Component({
    selector: 'app-login-on-behalf',
    templateUrl: './login-on-behalf.component.html',
    styleUrls: ['./login-on-behalf.component.css']
})
export class LoginOnBehalfComponent implements OnInit {
    connector;

    constructor(public router: Router, public activatedRoute: ActivatedRoute, public authService: AuthService) { }
    
    ngOnInit() {
        this.connector = new Interjet.Connector({
            autoload: false,
            provider: false,
            onMessage: event => {
                if(event.origin == 'https://admin-dot-findable-system.appspot.com') {
                    this.authService.update('currentUser', event.data);
                    this.connector.send({success: true}, event.source);
                }
            }
        });
    }
    
}
