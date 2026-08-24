import { TestBed } from '@angular/core/testing';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  BadgeAlert,
  BadgeCheck,
  Briefcase,
  BriefcaseBusiness,
  CalendarRange,
  ChartNoAxesCombined,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Coins,
  FileText,
  GitCompareArrows,
  HandCoins,
  House,
  Landmark,
  LayoutDashboard,
  LucideAngularModule,
  Minus,
  OctagonAlert,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Store,
  TriangleAlert,
  Users,
  X,
} from 'lucide-angular';
import { vi } from 'vitest';
import { ExecutiveGalleryComponent } from './executive-gallery.component';

vi.mock('lottie-web/build/player/lottie_light', () => ({
  default: {
    loadAnimation: () => ({
      destroy: vi.fn(),
      goToAndPlay: vi.fn(),
      goToAndStop: vi.fn(),
      play: vi.fn(),
    }),
  },
}));

describe('ExecutiveGalleryComponent', () => {
  it('renders the isolated catalog without assembling the final dashboard', async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExecutiveGalleryComponent,
        LucideAngularModule.pick({
          AlertTriangle,
          ArrowDown,
          ArrowLeftRight,
          ArrowRight,
          ArrowUp,
          BadgeAlert,
          BadgeCheck,
          Briefcase,
          BriefcaseBusiness,
          CalendarRange,
          ChartNoAxesCombined,
          CheckCircle,
          ChevronDown,
          ChevronRight,
          CircleCheck,
          Coins,
          FileText,
          GitCompareArrows,
          HandCoins,
          House,
          Landmark,
          LayoutDashboard,
          Minus,
          OctagonAlert,
          PanelLeftClose,
          PanelLeftOpen,
          Settings,
          ShieldAlert,
          ShieldCheck,
          Store,
          TriangleAlert,
          Users,
          X,
        }),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ExecutiveGalleryComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Galería ejecutiva');
    expect(fixture.nativeElement.textContent).toContain('Apache ECharts no está instalado');
    expect(fixture.nativeElement.querySelectorAll('gg-executive-metric-card').length).toBe(4);
  });
});
