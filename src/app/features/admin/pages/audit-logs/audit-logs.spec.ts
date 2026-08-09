import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLogs } from './audit-logs';
import { ChevronLeft, ChevronRight, Loader2, LucideAngularModule, RefreshCw } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';
import { SecurityService } from '../../../security/data-access/security.service';
import { of } from 'rxjs';

describe('AuditLogs', () => {
  let component: AuditLogs;
  let fixture: ComponentFixture<AuditLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogs],
      providers: [
        importProvidersFrom(LucideAngularModule.pick({ RefreshCw, Loader2, ChevronLeft, ChevronRight })),
        { provide: SecurityService, useValue: { getSecurityEvents: () => of({ data: [], current_page: 1, last_page: 1, total: 0 }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
