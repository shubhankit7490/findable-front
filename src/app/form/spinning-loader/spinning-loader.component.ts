import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-spinning-loader',
    templateUrl: './spinning-loader.component.html',
    styleUrls: ['./spinning-loader.component.css']
})
export class SpinningLoaderComponent {
    @Input() showLoader: boolean;

    constructor() { }

}
