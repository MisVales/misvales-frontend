import { ApplicationConfig, provideZonelessChangeDetection, ErrorHandler, Injectable, APP_INITIALIZER, inject, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorHandlingInterceptor } from '@core/interceptors/error-handling.interceptor';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { MeService } from '@core/services/me.service';
import Cookies from 'js-cookie';
import { firstValueFrom, catchError, of } from 'rxjs';
import {
  LucideAngularModule,
  // General
  Search, LayoutDashboard, Inbox, Bell, ChevronRight, ChevronDown, ChevronLeft,
  PanelLeftClose, PanelLeftOpen, Monitor, Info,
  // Distribuidoras
  Store, FileText, ClipboardCheck, ShieldCheck, BookOpen, Tags,
  // Clientes y vales
  UsersRound, UserRound, ScanSearch, Wallet, Ticket, TicketCheck,
  Banknote, FilePenLine, Calculator,
  // Crédito
  CreditCard, TrendingUp, CirclePlus, CircleArrowUp, AlertTriangle, ArrowLeftRight,
  // Relaciones y cobranza
  ReceiptText, CalendarRange, FileStack, Split, Hash, FileDown,
  GitMerge, GitPullRequest, MessageSquareWarning, CircleCheck, Percent, Undo2,
  // Puntos y riesgo
  Gift, Star, CalendarClock, PackageCheck, ShieldAlert, OctagonAlert, CheckSquare,
  // Movilidad
  ArrowRightLeft, Move, UserRoundX, Building,
  // Organización
  Building2, MapPin, Users, Link, Network,
  // Usuarios y acceso
  UserCog, MailPlus, Shield, KeyRound, Key, Grid3x3, UserCheck, MonitorSmartphone, Smartphone, Lock,
  // Configuración
  Settings, SlidersHorizontal, Package, Layers, Landmark, Globe,
  // Control
  ChartNoAxesCombined, ScrollText, FileTerminal, FolderArchive, Workflow, Activity,
  // Mi cuenta
  CircleUserRound, User, Clock, LogOut, Circle,
  // Otros UI
  X, Plus, Eye, EyeOff, Loader2, CheckCircle, CheckCircle2, RefreshCw, Save,
  // Legacy (usado en otros componentes)
  Briefcase, FolderKanban, FileCheck, ClipboardList, File, Terminal,
  Target, MessageSquare, History,
} from 'lucide-angular';
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    if (isDevMode()) {
      console.error('GLOBAL ERROR:', error);
      document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace; background:white; position:fixed; top:0; left:0; right:0; z-index:9999; word-break: break-all;">
        <h2>Application Error</h2>
        <pre>${error.message || error.toString()}</pre>
        <pre>${error.stack || ''}</pre>
      </div>`;
      return;
    }

    console.error('Ocurrió un error inesperado en la aplicación.');
  }
}

export function initializeApp() {
  const meService = inject(MeService);
  return () => {
    const token = Cookies.get('access_token');
    if (token) {
      return firstValueFrom(meService.fetchMe().pipe(
        catchError((err) => {
          console.warn('No se pudo restaurar la sesión:', err);
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          return of(null);
        })
      ));
    }
    return Promise.resolve(null);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorHandlingInterceptor
      ])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        // General
        Search, LayoutDashboard, Inbox, Bell, ChevronRight, ChevronDown, ChevronLeft,
        PanelLeftClose, PanelLeftOpen, Monitor, Info,
        // Distribuidoras
        Store, FileText, ClipboardCheck, ShieldCheck, BookOpen, Tags,
        // Clientes y vales
        UsersRound, UserRound, ScanSearch, Wallet, Ticket, TicketCheck,
        Banknote, FilePenLine, Calculator,
        // Crédito
        CreditCard, TrendingUp, CirclePlus, CircleArrowUp, AlertTriangle, ArrowLeftRight,
        // Relaciones y cobranza
        ReceiptText, CalendarRange, FileStack, Split, Hash, FileDown,
        GitMerge, GitPullRequest, MessageSquareWarning, CircleCheck, Percent, Undo2,
        // Puntos y riesgo
        Gift, Star, CalendarClock, PackageCheck, ShieldAlert, OctagonAlert, CheckSquare,
        // Movilidad
        ArrowRightLeft, Move, UserRoundX, Building,
        // Organización
        Building2, MapPin, Users, Link, Network,
        // Usuarios y acceso
        UserCog, MailPlus, Shield, KeyRound, Key, Grid3x3, UserCheck, MonitorSmartphone, Smartphone, Lock,
        // Configuración
        Settings, SlidersHorizontal, Package, Layers, Landmark, Globe,
        // Control
        ChartNoAxesCombined, ScrollText, FileTerminal, FolderArchive, Workflow, Activity,
        // Mi cuenta
        CircleUserRound, User, Clock, LogOut, Circle,
        // Otros UI
        X, Plus, Eye, EyeOff, Loader2, CheckCircle, CheckCircle2, RefreshCw, Save,
        // Legacy
        Briefcase, FolderKanban, FileCheck, ClipboardList, File, Terminal,
        Target, MessageSquare, History,
      })
    ),
    { provide: API_CONFIG, useValue: defaultApiConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: APP_INITIALIZER, useFactory: initializeApp, multi: true }
  ]
};
