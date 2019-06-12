import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingSliderComponent } from './rating-slider.component';

describe('RatingSliderComponent', () => {
  let component: RatingSliderComponent;
  let fixture: ComponentFixture<RatingSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatingSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
