import { Component, Input, ChangeDetectionStrategy, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription, merge } from 'rxjs';

export interface ValidationRule {
  label: string;
  test: (value: string) => boolean;
}

@Component({
  selector: 'app-validation-tooltip',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-flex items-center group cursor-help validation-tooltip">
      <div [class]="hasErrors() ? 'text-red-500' : 'text-green-500'">
        <lucide-icon [name]="hasErrors() ? 'info' : 'check-circle'" [size]="16" class="mt-0.5"></lucide-icon>
      </div>

      <!-- Tooltip Content -->
      <div class="absolute bottom-full left-0 mb-2 hidden w-64 max-w-[calc(100vw-2rem)] p-3 bg-white border border-gray-200 shadow-xl rounded-xl group-hover:block z-[100] validation-tooltip__content">
        <p class="text-xs font-semibold text-gray-700 mb-2">Requisitos:</p>
        <ul class="space-y-1.5">
          @for (rule of rules; track rule.label) {
            <li class="flex items-start gap-1.5 text-xs" [ngClass]="isRuleMet(rule) ? 'text-green-600 font-medium' : 'text-gray-500'">
              <lucide-icon [name]="isRuleMet(rule) ? 'check' : 'x'" [size]="14" class="mt-0.5" [class.text-red-500]="!isRuleMet(rule) && (control?.dirty || control?.touched)"></lucide-icon>
              <span class="leading-tight">{{ rule.label }}</span>
            </li>
          }
        </ul>
        <div class="absolute top-full left-2 -mt-[1px] border-4 border-transparent border-t-white"></div>
        <div class="absolute top-full left-2 -mt-[2px] border-4 border-transparent border-t-gray-200 -z-10"></div>
      </div>
    </div>
  `
})
export class ValidationTooltipComponent implements OnInit, OnDestroy {
  @Input({ required: true }) control!: AbstractControl;
  @Input({ required: true }) rules: ValidationRule[] = [];

  private cdr = inject(ChangeDetectorRef);
  private sub?: Subscription;

  ngOnInit() {
    this.sub = merge(this.control.valueChanges, this.control.statusChanges).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  isRuleMet(rule: ValidationRule): boolean {
    const val = this.control?.value || '';
    return rule.test(val);
  }

  hasErrors(): boolean {
    return this.rules.some(r => !this.isRuleMet(r));
  }
}
