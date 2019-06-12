import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsSectionComponent } from './charts-section.component';

describe('ChartsSectionComponent', () => {
  let component: ChartsSectionComponent;
  let fixture: ComponentFixture<ChartsSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
