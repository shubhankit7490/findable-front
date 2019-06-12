import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges
} from "@angular/core";

@Component({
  selector: "app-years-experience",
  templateUrl: "./years-experience.component.html",
  styleUrls: ["./years-experience.component.css"]
})
export class YearsExperienceComponent implements OnInit {
  @Input() minYears: number = 0;
  @Input() maxYears: number = 30;
  @Output()
  onSliderRelease = new EventEmitter<ExpYears>();
  @Output() onSliderChange = new EventEmitter<ExpYears>();
  @Input() from: number;
  @Input() to: number;

  sumYears: number;
  splitYears: number[] = [];

  ngOnInit() {
    this.generateSpacedYears();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.sumYears = this.to - this.from;
  }

  private generateSpacedYears() {
    for (var i = 0; i <= this.maxYears; i++) {
      if (i % 5 === 0) {
        this.splitYears.push(i);
      }
    }
  }

  private calcTotalYears(data) {
    this.sumYears = data.to - data.from;
  }

  public sliderOnStart(event) {
    this.calcTotalYears({
      from: event.min,
      to: event.max
    });
  }

  public sliderOnFinish(event) {
    this.calcTotalYears({
      from: event.from,
      to: event.to
    });

    this.onSliderRelease.emit({
      event: event,
      totalYears: this.sumYears
    });

    this.onSliderChange.emit({
      event: event,
      totalYears: this.sumYears,
      from: event.from,
      to: event.to
    });
  }
}

export interface ExpYears {
  event: Event;
  totalYears: number;
  from?: number;
  to?: number;
}
