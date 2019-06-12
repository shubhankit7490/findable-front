import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectListItemComponent } from './select-list-item.component';

describe('SelectListItemComponent', () => {
  let component: SelectListItemComponent;
  let fixture: ComponentFixture<SelectListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
