import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';

@Component({
    selector: 'app-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.css']
})
export class DrawerComponent implements OnInit {

	@Input() expanded: boolean = false;

	@Input() closedHeight: number = 52;

	@Input() title: string;

	@Output() onClose = new EventEmitter<any>();

	@Output() onOpen = new EventEmitter<any>();

	@ViewChild('drawer') drawer: ElementRef;

	@ViewChild('drawerContent') drawerContent: ElementRef;

	private realHeight: number;

	constructor() { }

	ngOnInit() {}

	ngAfterViewInit() {
		this.realHeight = this.drawerContent.nativeElement.offsetHeight + 70;

		this.setHeight();
	}

	toggleState(event?: any) {
		this.expanded = !this.expanded;

		this.setHeight();

		if(this.expanded) {
			this.onOpen.emit(event);
		}
		else {
			this.onClose.emit(event);
		}
	}

	setHeight() {
		if (!this.expanded) {
			this.drawer.nativeElement.style.height = this.closedHeight + 'px';
			this.drawer.nativeElement.style.overflow = 'hidden';
		}
		else {
			this.drawer.nativeElement.style.height = this.realHeight + 'px'
			setTimeout(() => {
				this.drawer.nativeElement.style.height = 'auto';
				this.drawer.nativeElement.style.overflow = 'visible';
			}, 500)
		}
	}

}
