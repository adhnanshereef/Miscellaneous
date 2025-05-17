import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteGeneratorComponent } from './quote-generator.component';

describe('QuoteGeneratorComponent', () => {
  let component: QuoteGeneratorComponent;
  let fixture: ComponentFixture<QuoteGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
