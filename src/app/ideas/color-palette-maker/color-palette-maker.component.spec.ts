import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorPaletteMakerComponent } from './color-palette-maker.component';

describe('ColorPaletteMakerComponent', () => {
  let component: ColorPaletteMakerComponent;
  let fixture: ComponentFixture<ColorPaletteMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPaletteMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorPaletteMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
