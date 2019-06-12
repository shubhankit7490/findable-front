import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';

// services:
import { AuthService } from '../../rest/service/auth.service';

@Component({
    selector: 'app-download-pdf-modal',
    templateUrl: './download-modal.component.html',
    styleUrls: ['./download-modal.component.css']
})
export class DownloadModalComponent implements OnInit, OnChanges {
    public userId: number = null;
    public valid: boolean = true;
    public blobData: boolean = false;
    @Input() blob: Blob;
    constructor(public authService: AuthService) {
        this.userId = this.authService.getUserId();
    }

    ngOnInit() {}

    download_pdf(blob: Blob) {
        console.log('download_pdf', this.blob, this.blobData);
        let url = window.URL.createObjectURL(blob);
        window.open(url, 'download_window');
    }
    
    /**
     * Check if the token was received @init time
     * @param {SimpleChange} changes
     */
    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        for (let p in changes) {
            let c = changes[p];
            if (!!c.currentValue) {
                this.blobData = c.currentValue;
            }
        }
    }
}
