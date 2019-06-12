import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartEducationComponent } from './chart-education.component';

describe('ChartEducationComponent', () => {
  let component: ChartEducationComponent;
  let fixture: ComponentFixture<ChartEducationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartEducationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
