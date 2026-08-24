import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BrandLockupComponent } from './brand-lockup.component';

@Component({
  standalone: true,
  imports: [BrandLockupComponent],
  template: '<app-brand-lockup variant="horizontal" />',
})
class HorizontalBrandHostComponent {}

@Component({
  standalone: true,
  imports: [BrandLockupComponent],
  template: '<app-brand-lockup variant="horizontal" [compact]="true" />',
})
class CompactBrandHostComponent {}

describe('BrandLockupComponent', () => {
  let fixture: ComponentFixture<BrandLockupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandLockupComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandLockupComponent);
    fixture.detectChanges();
  });

  it('usa el logo oficial sin contenedor visual de fondo', () => {
    const logo = fixture.nativeElement.querySelector('img.brand-lockup__logo') as HTMLImageElement;

    expect(logo).toBeTruthy();
    expect(logo.getAttribute('src')).toContain('logo_misvales.png');
    expect(logo.getAttribute('width')).toBe('832');
    expect(logo.getAttribute('height')).toBe('491');
    expect(fixture.nativeElement.querySelector('.brand-lockup__mark')).toBeNull();
  });

  it('mantiene un enlace accesible al inicio', () => {
    const link = fixture.nativeElement.querySelector('a.brand-lockup') as HTMLAnchorElement;

    expect(link.getAttribute('aria-label')).toBe('MisVales, ir al inicio');
    expect(link.getAttribute('href')).toBe('/inicio');
  });

  it('selecciona el imagotipo horizontal para espacios amplios', () => {
    const host = TestBed.createComponent(HorizontalBrandHostComponent);
    host.detectChanges();

    const logo = host.nativeElement.querySelector('img.brand-lockup__logo') as HTMLImageElement;
    expect(logo.getAttribute('src')).toContain('imagotipo-vales2.png');
    expect(logo.getAttribute('width')).toBe('1902');
    expect(logo.getAttribute('height')).toBe('502');
  });

  it('prioriza el imagotipo compacto cuando la navegación se colapsa', () => {
    const host = TestBed.createComponent(CompactBrandHostComponent);
    host.detectChanges();

    const logo = host.nativeElement.querySelector('img.brand-lockup__logo') as HTMLImageElement;
    expect(logo.getAttribute('src')).toContain('imagotipo-vales.png');
    expect(logo.getAttribute('width')).toBe('1504');
    expect(logo.getAttribute('height')).toBe('1209');
  });
});
