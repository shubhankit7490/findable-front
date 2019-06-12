import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareSectionComponent } from './share-section.component';

describe('ShareSectionComponent', () => {
  let component: ShareSectionComponent;
  let fixture: ComponentFixture<ShareSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
