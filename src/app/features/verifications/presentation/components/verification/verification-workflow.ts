import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RefactorInputComponent } from '@shared/components/inputs/refactor-input/refactor-input.component';
import {
  RefactorSelectComponent,
  RefactorSelectOption,
} from '@shared/components/inputs/refactor-select/refactor-select.component';
import {
  AccordionSection,
  DecisionOption,
  DifferenceItem,
  VerificationChoice,
  VerificationField,
  VerificationStep,
} from '../../models/verification.models';
import {
  CharacterCounterTextareaComponent,
  VerificationStatusBadgeComponent,
} from '../primitives/verification-primitives';
const SHARED = '../../styles/verification-tokens.css';
export const DEFAULT_CHOICES: readonly VerificationChoice[] = [
  { value: 'verified', label: 'Comprobado' },
  { value: 'difference', label: 'Diferencia' },
  { value: 'not-applicable', label: 'No aplica' },
];

@Component({
  selector: 'verification-process-stepper',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .steps {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .step {
        align-items: center;
        display: flex;
        flex: 1;
        gap: 10px;
        position: relative;
      }
      .step:not(:last-child):after {
        background: #d9e0dd;
        content: '';
        height: 1px;
        left: 55px;
        position: absolute;
        right: 14px;
        top: 21px;
      }
      .number {
        align-items: center;
        background: #fff;
        border: 1px solid #cdd5d2;
        border-radius: 50%;
        display: flex;
        font-weight: 800;
        height: 42px;
        justify-content: center;
        position: relative;
        width: 42px;
        z-index: 1;
      }
      .completed .number,
      .active .number {
        background: var(--v-green-soft);
        border-color: var(--v-green);
        color: var(--v-green);
      }
      .active:before {
        background: var(--v-green);
        bottom: -13px;
        content: '';
        height: 3px;
        left: 0;
        position: absolute;
        right: 20px;
      }
      .copy {
        font-size: 11px;
      }
      .copy strong {
        display: block;
      }
      .copy span {
        color: var(--v-muted);
      }
      @media (max-width: 700px) {
        .steps {
          gap: 8px;
          overflow: auto;
        }
        .step {
          min-width: 150px;
        }
      }
    `,
  ],
  template: `<ol class="steps" aria-label="Progreso">
    @for (step of steps; track step.label; let index = $index) {
      <li
        class="step {{ step.state }}"
        [attr.aria-current]="step.state === 'active' ? 'step' : null"
      >
        <span class="number">{{ step.state === 'completed' ? '✓' : index + 1 }}</span
        ><span class="copy"
          ><strong>{{ step.label }}</strong
          ><span>{{ step.description }}</span></span
        >
      </li>
    }
  </ol>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationProcessStepperComponent {
  @Input() steps: readonly VerificationStep[] = [];
}

@Component({
  selector: 'verification-result-option',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .choice {
        align-items: center;
        background: transparent;
        border: 0;
        color: var(--v-muted);
        cursor: pointer;
        display: inline-flex;
        font-size: 11px;
        gap: 6px;
        padding: 5px;
      }
      .radio {
        border: 1px solid #bfc8cf;
        border-radius: 50%;
        height: 13px;
        width: 13px;
      }
      .selected {
        color: var(--v-green);
      }
      .selected .radio {
        border: 4px solid var(--v-green);
      }
      .difference.selected {
        color: var(--v-red);
      }
      .difference.selected .radio {
        border-color: var(--v-red);
      }
    `,
  ],
  template: `@if (readOnly) {
      <span class="choice {{ value }}" [class.selected]="selected" [attr.aria-label]="label"
        ><span class="radio"></span>{{ label }}</span
      >
    } @else {
      <button
        class="choice {{ value }}"
        [class.selected]="selected"
        type="button"
        role="radio"
        [attr.aria-checked]="selected"
        [disabled]="disabled"
        (click)="chosen.emit(value)"
      >
        <span class="radio"></span>{{ label }}
      </button>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationResultOptionComponent {
  @Input() value: VerificationChoice['value'] = 'verified';
  @Input() label = 'Comprobado';
  @Input() selected = false;
  @Input() disabled = false;
  @Input() readOnly = true;
  @Output() readonly chosen = new EventEmitter<VerificationChoice['value']>();
}

@Component({
  selector: 'verification-field-row',
  standalone: true,
  imports: [VerificationResultOptionComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .field {
        align-items: center;
        border-top: 1px solid #edf0f1;
        display: grid;
        gap: 12px;
        grid-template-columns: 1fr 1.4fr 2fr;
        min-height: 48px;
        padding: 8px 0;
      }
      .name {
        font-weight: 650;
      }
      .declared {
        color: #414b5d;
      }
      .options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      @media (max-width: 680px) {
        .field {
          grid-template-columns: 1fr;
        }
        .options {
          padding-bottom: 6px;
        }
      }
    `,
  ],
  template: `<div class="field">
    <span class="name">{{ field.name }}</span
    ><span class="declared">{{ field.declaredValue }}</span>
    @if (readOnly) {
      <span class="readonly-result">{{ selectedLabel }}</span>
    } @else {
      <div class="options" role="radiogroup" [attr.aria-label]="field.name">
        @for (option of options; track option.value) {
          <verification-result-option
            [value]="option.value"
            [label]="option.label"
            [selected]="field.selected === option.value"
            (chosen)="changed.emit($event)"
          />
        }
      </div>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationFieldRowComponent {
  @Input({ required: true }) field!: VerificationField;
  @Input() options = DEFAULT_CHOICES;
  @Input() readOnly = true;
  @Output() readonly changed = new EventEmitter<VerificationChoice['value']>();
  protected get selectedLabel(): string {
    return (
      this.options.find((option) => option.value === this.field.selected)?.label ?? 'Sin resultado'
    );
  }
}

@Component({
  selector: 'verification-difference-counter',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .difference {
        background: #fff0f0;
        border-radius: 99px;
        color: var(--v-red);
        display: inline-flex;
        font-size: 10px;
        font-weight: 750;
        padding: 5px 8px;
      }
    `,
  ],
  template: `@if (count > 0) {
    <span class="difference">⚠ {{ count }} {{ count === 1 ? 'diferencia' : 'diferencias' }}</span>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifferenceCounterBadgeComponent {
  @Input() count = 0;
}

@Component({
  selector: 'verification-accordion',
  standalone: true,
  imports: [
    VerificationStatusBadgeComponent,
    DifferenceCounterBadgeComponent,
    VerificationFieldRowComponent,
  ],
  styleUrls: [SHARED],
  styles: [
    `
      .accordion {
        border: 1px solid var(--v-line);
        border-radius: 10px;
        overflow: hidden;
      }
      .section + .section {
        border-top: 1px solid var(--v-line);
      }
      .trigger {
        align-items: center;
        background: #fff;
        border: 0;
        cursor: pointer;
        display: flex;
        gap: 10px;
        padding: 12px 14px;
        text-align: left;
        width: 100%;
        transition:
          background-color 220ms ease,
          color 220ms ease;
      }
      .trigger strong {
        flex: 1;
      }
      .open .trigger {
        background: linear-gradient(90deg, #edf9f1, #fff);
      }
      .body-shell {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows 240ms cubic-bezier(0.2, 0, 0, 1),
          opacity 180ms ease;
      }
      .open .body-shell {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .body-clip {
        min-height: 0;
        overflow: hidden;
      }
      .body {
        padding: 0 16px 13px;
      }
      .caption {
        color: var(--v-muted);
        display: grid;
        font-size: 10px;
        grid-template-columns: 1fr 1.4fr 2fr;
        padding: 10px 0;
      }
      @media (prefers-reduced-motion: reduce) {
        .trigger,
        .body-shell {
          transition: none;
        }
      }
    `,
  ],
  template: `<div class="accordion">
    @for (section of sections; track section.id) {
      <section class="section" [class.open]="isOpen(section.id)">
        <button
          class="trigger"
          type="button"
          [attr.aria-expanded]="isOpen(section.id)"
          (click)="toggle(section.id)"
        >
          <span>{{ section.icon }}</span
          ><strong>{{ section.label }}</strong>
          @if (section.differences) {
            <verification-difference-counter [count]="section.differences" />
          } @else if (section.status) {
            <verification-status-badge [status]="section.status" />
          }
          <span>{{ isOpen(section.id) ? '⌃' : '⌄' }}</span>
        </button>
        @if (section.fields) {
          <div class="body-shell" [attr.aria-hidden]="!isOpen(section.id)">
            <div class="body-clip">
              <div class="body">
                <div class="caption">
                  <span>Campo</span><span>Valor declarado</span><span>Resultado observado</span>
                </div>
                @for (field of section.fields; track field.name) {
                  <verification-field-row
                    [field]="field"
                    [readOnly]="readOnly"
                    (changed)="
                      fieldChanged.emit({ sectionId: section.id, field: field.name, value: $event })
                    "
                  />
                }
              </div>
            </div>
          </div>
        }
      </section>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationAccordionComponent {
  @Input() sections: readonly AccordionSection[] = [];
  @Input() multiple = false;
  @Input() initialOpen: readonly string[] = [];
  @Input() readOnly = true;
  @Output() readonly fieldChanged = new EventEmitter<{
    sectionId: string;
    field: string;
    value: VerificationChoice['value'];
  }>();
  private readonly open = signal<readonly string[]>([]);
  ngOnChanges(): void {
    if (!this.open().length && this.initialOpen.length) this.open.set(this.initialOpen);
  }
  protected isOpen(id: string): boolean {
    return this.open().includes(id);
  }
  protected toggle(id: string): void {
    this.open.update((ids) =>
      ids.includes(id) ? ids.filter((v) => v !== id) : this.multiple ? [...ids, id] : [id],
    );
  }
  expandAll(): void {
    this.open.set(this.sections.map((s) => s.id));
  }
  collapseAll(): void {
    this.open.set([]);
  }
}

@Component({
  selector: 'verification-difference-form',
  standalone: true,
  imports: [
    FormsModule,
    CharacterCounterTextareaComponent,
    RefactorInputComponent,
    RefactorSelectComponent,
  ],
  styleUrls: [SHARED],
  styles: [
    `
      .form {
        padding: 18px;
      }
      .form h3 {
        margin: 0;
      }
      .form > p {
        color: var(--v-muted);
        font-size: 11px;
        margin: 5px 0 18px;
      }
      .group {
        display: grid;
        gap: 7px;
        margin-bottom: 14px;
      }
      .group label {
        font-size: 11px;
        font-weight: 700;
      }
      .readonly {
        background: #f3f4f5;
      }
      .actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 14px;
      }
    `,
  ],
  template: `<form class="v-card form" (submit)="submitForm($event)">
    <h3>{{ title }}</h3>
    <p>{{ subtitle }}</p>
    <div class="group">
      <refactor-select
        label="Sección y campo"
        placeholder="Selecciona el dato observado"
        leadingIcon="clipboard-list"
        hint="Ubica la diferencia dentro del expediente."
        [options]="sectionSelectOptions"
        [required]="true"
        [(ngModel)]="model.section"
        name="section"
        [readOnly]="readOnly"
      />
    </div>
    <div class="group">
      <refactor-select
        label="Registro relacionado"
        placeholder="Selecciona un registro"
        leadingIcon="link"
        [options]="recordSelectOptions"
        [clearable]="true"
        [(ngModel)]="model.record"
        name="record"
        [readOnly]="readOnly"
      />
    </div>
    <div class="group">
      <refactor-input
        label="Valor declarado"
        leadingIcon="file-text"
        [ngModel]="declaredValue"
        [ngModelOptions]="{ standalone: true }"
        [readonly]="true"
      />
    </div>
    <div class="group">
      <refactor-input
        label="Valor observado físicamente"
        placeholder="Escribe el valor encontrado"
        leadingIcon="scan-search"
        [(ngModel)]="model.observed"
        name="observed"
        [required]="required"
        [readonly]="readOnly"
      />
    </div>
    <label class="group"
      >Descripción de la diferencia<verification-character-textarea
        [(value)]="model.description"
        [maxLength]="maxLength"
        [required]="required"
        [readonly]="readOnly"
    /></label>
    @if (!readOnly) {
      <div class="actions">
        <button class="v-button outline" type="button" (click)="cancel.emit()">Cancelar</button
        ><button class="v-button primary" type="submit">Guardar diferencia</button>
      </div>
    }
  </form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifferenceFormComponent {
  @Input() title = 'Registrar diferencia';
  @Input() subtitle = 'El registro del expediente no se modifica.';
  @Input() sectionOptions: readonly string[] = [];
  @Input() recordOptions: readonly string[] = [];
  @Input() declaredValue = '';
  @Input() maxLength = 500;
  @Input() required = true;
  @Input() readOnly = true;
  @Output() readonly save = new EventEmitter<{
    section: string;
    record: string;
    observed: string;
    description: string;
  }>();
  @Output() readonly cancel = new EventEmitter<void>();
  @Output() readonly changed = new EventEmitter<object>();
  protected model = { section: '', record: '', observed: '', description: '' };
  protected submitForm(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.readOnly) this.save.emit(this.model);
  }
  protected get sectionSelectOptions(): readonly RefactorSelectOption[] {
    return this.sectionOptions.map((option) => ({
      value: option,
      label: option,
      icon: 'file-check',
    }));
  }
  protected get recordSelectOptions(): readonly RefactorSelectOption[] {
    return this.recordOptions.map((option) => ({ value: option, label: option, icon: 'map-pin' }));
  }
}

@Component({
  selector: 'verification-observation-panel',
  standalone: true,
  imports: [CharacterCounterTextareaComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .panel {
        padding: 18px;
      }
      .panel h3 {
        margin: 0;
      }
      .panel p {
        color: var(--v-muted);
        font-size: 11px;
        margin: 5px 0 14px;
      }
    `,
  ],
  template: `<section class="v-card panel">
    <h3>{{ title }}</h3>
    <p>{{ subtitle }}</p>
    <verification-character-textarea
      [value]="value"
      (valueChange)="valueChange.emit($event)"
      [maxLength]="maxLength"
      [placeholder]="placeholder"
      [required]="required"
      [readonly]="readOnly"
    />
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationPanelComponent {
  @Input() title = 'Observaciones generales de la visita';
  @Input() subtitle = 'Notas adicionales sobre la visita.';
  @Input() value = '';
  @Input() maxLength = 1000;
  @Input() placeholder = 'Describe los hallazgos generales…';
  @Input() required = false;
  @Input() readOnly = true;
  @Output() readonly valueChange = new EventEmitter<string>();
}

@Component({
  selector: 'verification-difference-item',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .item {
        align-items: center;
        background: #fff4f4;
        border: 1px solid #ffcaca;
        border-radius: 10px;
        color: #b62424;
        display: flex;
        gap: 11px;
        min-height: 62px;
        padding: 11px;
      }
      .item button {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        text-align: left;
      }
      .icon {
        font-size: 19px;
      }
    `,
  ],
  template: `<div class="item">
    <span class="icon">⚠</span>
    @if (clickable) {
      <button type="button" (click)="selected.emit()">{{ item.text }}</button>
    } @else {
      <span>{{ item.text }}</span>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifferenceAlertItemComponent {
  @Input({ required: true }) item!: DifferenceItem;
  @Input() clickable = false;
  @Output() readonly selected = new EventEmitter<void>();
}

@Component({
  selector: 'verification-difference-list',
  standalone: true,
  imports: [DifferenceAlertItemComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .list {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      }
    `,
  ],
  template: `<div class="list">
    @for (item of items; track item.text) {
      <verification-difference-item
        [item]="item"
        [clickable]="clickable && !readOnly"
        (selected)="selected.emit(item)"
      />
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifferenceListComponent {
  @Input() items: readonly DifferenceItem[] = [];
  @Input() clickable = false;
  @Input() readOnly = true;
  @Output() readonly selected = new EventEmitter<DifferenceItem>();
}

@Component({
  selector: 'verification-decision-option',
  standalone: true,
  styleUrls: [SHARED],
  styles: [
    `
      .decision {
        align-items: center;
        background: #fff;
        border: 1px solid var(--v-line);
        border-radius: 11px;
        cursor: pointer;
        display: grid;
        gap: 14px;
        grid-template-columns: 20px 58px 1fr;
        padding: 15px;
        text-align: left;
        width: 100%;
      }
      .selected.favorable {
        background: #f2fbf5;
        border-color: var(--v-green);
      }
      .selected.unfavorable {
        background: #fff5f5;
        border-color: var(--v-red);
      }
      .radio {
        border: 1px solid #9ca7b0;
        border-radius: 50%;
        height: 17px;
        width: 17px;
      }
      .selected .radio {
        border: 5px solid var(--v-green);
      }
      .unfavorable.selected .radio {
        border-color: var(--v-red);
      }
      .icon {
        align-items: center;
        background: var(--v-green-soft);
        border-radius: 14px;
        color: var(--v-green);
        display: flex;
        font-size: 30px;
        height: 54px;
        justify-content: center;
      }
      .unfavorable .icon {
        background: #fff0f0;
        color: var(--v-red);
      }
      h4 {
        font-size: 17px;
        margin: 0 0 5px;
      }
      p {
        font-size: 11px;
        line-height: 1.5;
        margin: 0;
      }
    `,
  ],
  template: `@if (readOnly) {
      <article
        class="decision {{ option.tone }}"
        [class.selected]="selected"
        [attr.aria-label]="option.label"
      >
        <span class="radio"></span><span class="icon">{{ option.icon }}</span
        ><span
          ><h4>{{ option.label }}</h4>
          <p>{{ option.description }}</p></span
        >
      </article>
    } @else {
      <button
        class="decision {{ option.tone }}"
        [class.selected]="selected"
        type="button"
        role="radio"
        [attr.aria-checked]="selected"
        (click)="chosen.emit(option.value)"
      >
        <span class="radio"></span><span class="icon">{{ option.icon }}</span
        ><span
          ><h4>{{ option.label }}</h4>
          <p>{{ option.description }}</p></span
        >
      </button>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationDecisionOptionComponent {
  @Input({ required: true }) option!: DecisionOption;
  @Input() selected = false;
  @Input() readOnly = true;
  @Output() readonly chosen = new EventEmitter<string>();
}

@Component({
  selector: 'verification-decision-group',
  standalone: true,
  imports: [VerificationDecisionOptionComponent],
  styleUrls: [SHARED],
  styles: [
    `
      .group {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
    `,
  ],
  template: `<div class="group" role="radiogroup" [attr.aria-label]="label">
    @for (option of options; track option.value) {
      <verification-decision-option
        [option]="option"
        [selected]="value === option.value"
        [readOnly]="readOnly"
        (chosen)="select($event)"
      />
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationDecisionGroupComponent {
  @Input() label = 'Resultado de la verificación';
  @Input() options: readonly DecisionOption[] = [];
  @Input() value = '';
  @Input() readOnly = true;
  @Output() readonly valueChange = new EventEmitter<string>();
  protected select(value: string): void {
    if (this.readOnly) return;
    this.value = value;
    this.valueChange.emit(value);
  }
}
