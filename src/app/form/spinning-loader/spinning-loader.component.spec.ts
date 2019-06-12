import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinningLoaderComponent } from './spinning-loader.component';

describe('SpinningLoaderComponent', () => {
  let component: SpinningLoaderComponent;
  let fixture: ComponentFixture<SpinningLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinningLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinningLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
