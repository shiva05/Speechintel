import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallTranscriptsComponent } from './call-transcripts.component';

describe('CallTranscriptsComponent', () => {
  let component: CallTranscriptsComponent;
  let fixture: ComponentFixture<CallTranscriptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallTranscriptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallTranscriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
