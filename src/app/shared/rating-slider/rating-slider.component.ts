import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';

export interface RatedItem {
    id: number;
    name: string;
    level: number;
}

@Component({
    selector: 'app-rating-slider',
    templateUrl: './rating-slider.component.html',
    styleUrls: ['./rating-slider.component.css']
})
export class RatingSliderComponent implements OnInit {
    @ViewChild('slider') slider;

    @Input() minNum: number = 1;

    @Input() maxNum: number = 100;

    @Input() ratingValues = [];

    @Input() items: RatedItem[];

    @Output() onUpdate = new EventEmitter<any>();

    @Output() onRemove = new EventEmitter<any>();

    currentNum: number;

    selectedItem: RatedItem;

    constructor() { }

    ngOnInit() {}

    removeItem(index) {
        let item = this.items[index]

        this.items.splice(index, 1);
        this.currentNum = 1;

        this.slider.update({ from: this.minNum })
        this.onRemove.emit(item);
    }

    selectItem(index) {
        this.selectedItem = this.items[index];

        this.currentNum = this.items[index].level;
        this.slider.update({ from: this.currentNum });
    }

    updateItem(event) {
        if(!this.selectedItem) {
            return;
        }

        this.selectedItem.level = event.from;
    }
}
