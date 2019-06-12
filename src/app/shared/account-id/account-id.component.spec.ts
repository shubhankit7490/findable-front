import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountIdComponent } from './account-id.component';

describe('AccountIdComponent', () => {
  let component: AccountIdComponent;
  let fixture: ComponentFixture<AccountIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
