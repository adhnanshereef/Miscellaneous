import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsciiArtViewerComponent } from './ascii-art-viewer.component';

describe('AsciiArtViewerComponent', () => {
  let component: AsciiArtViewerComponent;
  let fixture: ComponentFixture<AsciiArtViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsciiArtViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsciiArtViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
