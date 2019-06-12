import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartExperienceComponent } from './chart-experience.component';

describe('ChartExperienceComponent', () => {
  let component: ChartExperienceComponent;
  let fixture: ComponentFixture<ChartExperienceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartExperienceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
