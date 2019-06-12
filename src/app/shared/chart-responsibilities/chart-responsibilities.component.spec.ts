import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartResponsibilitiesComponent } from './chart-responsibilities.component';

describe('ChartResponsibilitiesComponent', () => {
  let component: ChartResponsibilitiesComponent;
  let fixture: ComponentFixture<ChartResponsibilitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartResponsibilitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartResponsibilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
