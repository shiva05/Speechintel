import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallIngestionComponent } from './call-ingestion.component';

describe('CallIngestionComponent', () => {
  let component: CallIngestionComponent;
  let fixture: ComponentFixture<CallIngestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallIngestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallIngestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
