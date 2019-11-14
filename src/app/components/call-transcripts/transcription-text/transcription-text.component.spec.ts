import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionTextComponent } from './transcription-text.component';

describe('TranscriptionTextComponent', () => {
  let component: TranscriptionTextComponent;
  let fixture: ComponentFixture<TranscriptionTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranscriptionTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranscriptionTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
