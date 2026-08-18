import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnstileComponent } from './turnstile.component';
import { TurnstileService } from '../../../core/turnstile/turnstile.service';

describe('TurnstileComponent', () => {
  let component: TurnstileComponent;
  let fixture: ComponentFixture<TurnstileComponent>;
  let mockTurnstileService: Partial<TurnstileService>;

  beforeEach(async () => {
    mockTurnstileService = {
      isEnabled: false,
      siteKey: '',
      render: vi.fn().mockResolvedValue('widget-1'),
      reset: vi.fn(),
      remove: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TurnstileComponent],
      providers: [
        { provide: TurnstileService, useValue: mockTurnstileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TurnstileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render container when disabled', () => {
    const container = fixture.nativeElement.querySelector('.turnstile-container');
    expect(container).toBeNull();
  });
});
