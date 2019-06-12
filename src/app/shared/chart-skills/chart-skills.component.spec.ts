import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSkillsComponent } from './chart-skills.component';

describe('ChartSkillsComponent', () => {
  let component: ChartSkillsComponent;
  let fixture: ComponentFixture<ChartSkillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSkillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
