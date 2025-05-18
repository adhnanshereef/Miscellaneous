import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveSoundboardComponent } from './interactive-soundboard.component';

describe('InteractiveSoundboardComponent', () => {
  let component: InteractiveSoundboardComponent;
  let fixture: ComponentFixture<InteractiveSoundboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveSoundboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveSoundboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
