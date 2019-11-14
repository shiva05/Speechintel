import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatefilterComponent } from './datefilter.component';

describe('DatefilterComponent', () => {
  let component: DatefilterComponent;
  let fixture: ComponentFixture<DatefilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatefilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatefilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
