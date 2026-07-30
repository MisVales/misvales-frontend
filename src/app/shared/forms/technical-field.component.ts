import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export type TechnicalFieldKind =
  | 'checkbox'
  | 'date'
  | 'datetime-local'
  | 'decimal'
  | 'email'
  | 'money'
  | 'password'
  | 'radio'
  | 'search'
  | 'select'
  | 'textarea'
  | 'text';

export interface TechnicalFieldOption {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'mv-technical-field',
  imports: [ReactiveFormsModule],
  templateUrl: './technical-field.component.html',
  styleUrl: './technical-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalFieldComponent {
  readonly control = input.required<FormControl<boolean | null | string>>();
  readonly kind = input<TechnicalFieldKind>('text');
  readonly label = input.required<string>();
  readonly name = input.required<string>();
  readonly required = input(false);
  readonly help = input<string | null>(null);
  readonly options = input<readonly TechnicalFieldOption[]>([]);
  readonly localError = input<string | null>(null);
  readonly serverErrors = input<readonly string[]>([]);

  readonly describedBy = computed(() => {
    const identifiers: string[] = [];
    if (this.help()) {
      identifiers.push(`${this.name()}-help`);
    }
    if (this.localError() || this.serverErrors().length > 0) {
      identifiers.push(`${this.name()}-error`);
    }
    return identifiers.join(' ');
  });

  inputType(): 'date' | 'datetime-local' | 'email' | 'password' | 'search' | 'text' {
    const kind = this.kind();
    if (
      kind === 'date' ||
      kind === 'datetime-local' ||
      kind === 'email' ||
      kind === 'password' ||
      kind === 'search'
    ) {
      return kind;
    }

    return 'text';
  }
}
