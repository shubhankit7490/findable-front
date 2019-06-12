import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';

// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';

import { environment } from 'environments/environment';
import { AutoUnsubscribe } from '../../../utils/autoUnsubscribe';

declare let moment: any;
declare let hljs: any;

@Component({
	selector: 'general-embedding',
	templateUrl: './general-embedding.component.html',
	styleUrls: ['./general-embedding.component.css']
})
@AutoUnsubscribe()
export class GeneralEmbeddingComponent implements OnInit, AfterViewInit {
	@Input() companyName = '';
	@ViewChild('snippet') snippet: ElementRef;
	@ViewChild('link') link: ElementRef;
	@ViewChild('email') email: ElementRef;
	public baseLink = '';

	constructor(public dataService: DataService, public authService: AuthService, public analyticsService: AnalyticsService) {
	}

	ngOnInit() {
		this.baseLink = environment.baseUrl.replace('http:', '').replace('https:', '');
		this.analyticsService.emitPageview('General Embedding');
	}

	ngAfterViewInit() {
		hljs.highlightBlock(this.snippet.nativeElement);
		hljs.highlightBlock(this.link.nativeElement);
	}

	selectSnippet(e: any) {
		let d = <HTMLDocument>window.document,
			b = <HTMLBodyElement>d.body,
			w = <Window>window,
			range,
			sel;

		if (w.getSelection && d.createRange) {
			range = d.createRange();
			range.selectNodeContents(e);
			sel = w.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (d['selection'] && b['createTextRange']) {
			range = b['createTextRange']();
			range.moveToElementText(e);
			range.select();
		}
	}
}
