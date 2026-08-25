import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  RefactorInputComponent,
  RefactorInputValidationRule,
} from '@shared/components/inputs/refactor-input/refactor-input.component';
import { RefactorSelectOption } from '@shared/components/inputs/refactor-select/refactor-select.component';
import { AttachmentAnimationType } from '@shared/components/media/attachment-animation/attachment-animation.component';
import { VerificationEvidenceGalleryComponent } from '@features/verifications/presentation/components/evidence/verification-evidence';
import {
  ApplicantSummaryCardComponent,
  DeclaredDataSummaryComponent,
  DetailGridComponent,
  FilterButtonComponent,
  ReadOnlyDataTableComponent,
  RequestDetailCardComponent,
  RequestTableComponent,
  SearchInputComponent,
  VisitSummaryCardComponent,
} from '@features/verifications/presentation/components/data/verification-data';
import {
  ActionFooterComponent,
  AppButtonComponent,
  EmptyStateComponent,
  FilterPillComponent,
  InformationBannerComponent,
  PageContextHeaderComponent,
  SectionCardComponent,
  TopHeaderComponent,
  UserMenuComponent,
  ValidationMessageComponent,
  VerificationStatCardComponent,
  VerificationStatusBadgeComponent,
} from '@features/verifications/presentation/components/primitives/verification-primitives';
import { VerificationContextTileComponent } from '@features/verifications/presentation/components/primitives/verification-asset-icon.component';
import { VerificationLocationComponent } from '@features/verifications/presentation/components/location/verification-location.component';
import {
  DifferenceFormComponent,
  DifferenceListComponent,
  ObservationPanelComponent,
  VerificationAccordionComponent,
  VerificationDecisionGroupComponent,
  VerificationFieldRowComponent,
  VerificationProcessStepperComponent,
} from '@features/verifications/presentation/components/verification/verification-workflow';
import {
  ActionConfig,
  RequestItem,
  VerificationChoice,
  VerificationField,
  VerificationStatus,
} from '@features/verifications/presentation/models/verification.models';
import {
  ACCORDION,
  DECLARED_DATA,
  DECISIONS,
  DIFFERENCES,
  EVIDENCES,
  PERSONAL_DETAILS,
  REQUESTS,
  STEPS,
  TABLE_COLUMNS,
  TABLE_ROWS,
} from '../../fixtures/verification/verification.mocks';

@Component({
  selector: 'refactor-verification-gallery',
  standalone: true,
  imports: [
    FormsModule,
    RefactorInputComponent,
    TopHeaderComponent,
    PageContextHeaderComponent,
    InformationBannerComponent,
    VerificationStatusBadgeComponent,
    FilterPillComponent,
    VerificationStatCardComponent,
    SectionCardComponent,
    DetailGridComponent,
    ReadOnlyDataTableComponent,
    EmptyStateComponent,
    VerificationProcessStepperComponent,
    VerificationAccordionComponent,
    VerificationFieldRowComponent,
    DifferenceFormComponent,
    ObservationPanelComponent,
    ApplicantSummaryCardComponent,
    VisitSummaryCardComponent,
    RequestTableComponent,
    RequestDetailCardComponent,
    SearchInputComponent,
    FilterButtonComponent,
    DeclaredDataSummaryComponent,
    VerificationEvidenceGalleryComponent,
    DifferenceListComponent,
    VerificationDecisionGroupComponent,
    ValidationMessageComponent,
    ActionFooterComponent,
    AppButtonComponent,
    UserMenuComponent,
    VerificationContextTileComponent,
    VerificationLocationComponent,
  ],
  templateUrl: './verification-gallery.component.html',
  styleUrl: './verification-gallery.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationGalleryComponent {
  protected readonly statuses: readonly VerificationStatus[] = [
    'pending',
    'visiting',
    'evidence',
    'differences',
    'to-send',
    'completed',
    'no-differences',
    'review',
    'consultable',
    'required',
    'not-applicable',
  ];
  protected readonly filters: readonly {
    label: string;
    count: number;
    icon?: string;
    animationType?: AttachmentAnimationType;
  }[] = [
    { label: 'Todas', count: 24, icon: '☷' },
    { label: 'Pendientes', count: 7, animationType: 'clock' },
    { label: 'En visita', count: 5, icon: '♙' },
    { label: 'Con evidencia', count: 6, animationType: 'folder' },
    { label: 'Con diferencias', count: 3, icon: '⚠' },
    { label: 'Por enviar', count: 3, icon: '➤' },
  ] as const;
  protected readonly activeFilter = signal('Todas');
  protected readonly selectedRequest = signal<RequestItem>(REQUESTS[0]);
  protected readonly search = signal('');
  protected readonly requestStatus = signal<string | null>(null);
  protected readonly requestStatusOptions: readonly RefactorSelectOption[] = [
    {
      value: 'pending',
      label: 'Pendiente',
      description: 'Aún no inicia la visita',
      tone: 'orange',
    },
    { value: 'visiting', label: 'En visita', description: 'Verificación en proceso', tone: 'blue' },
    {
      value: 'evidence',
      label: 'Con evidencia',
      description: 'Cuenta con archivos consultables',
      tone: 'green',
    },
    {
      value: 'differences',
      label: 'Con diferencias',
      description: 'Requiere revisar hallazgos',
      tone: 'red',
    },
    { value: 'to-send', label: 'Por enviar', description: 'Resultado preparado', tone: 'purple' },
    { value: 'completed', label: 'Completado', description: 'Proceso finalizado', tone: 'green' },
    {
      value: 'no-differences',
      label: 'Sin diferencias',
      description: 'Información consistente',
      tone: 'green',
    },
    {
      value: 'review',
      label: 'En revisión',
      description: 'Pendiente de validación',
      tone: 'purple',
    },
    {
      value: 'consultable',
      label: 'Consultable',
      description: 'Disponible en modo lectura',
      tone: 'blue',
    },
    {
      value: 'required',
      label: 'Obligatoria',
      description: 'Información requerida',
      tone: 'orange',
    },
    { value: 'not-applicable', label: 'No aplica', description: 'Fuera del alcance', tone: 'gray' },
  ];
  protected readonly decision = signal('favorable');
  protected readonly ine = signal('');
  protected readonly ineRules: readonly RefactorInputValidationRule[] = [
    { label: 'Contiene exactamente 18 caracteres.', test: (value) => value.length === 18 },
    {
      label: 'Usa solamente letras mayúsculas y números.',
      test: (value) => /^[A-ZÑ0-9]*$/.test(value),
    },
    {
      label: 'Sigue el orden: 6 letras, 8 números y 4 caracteres.',
      test: (value) => /^[A-ZÑ]{6}\d{8}[A-Z0-9]{4}$/.test(value),
    },
  ];
  protected readonly sampleField = signal<VerificationField>({
    name: 'Tipo de vivienda',
    declaredValue: 'Propia',
    selected: 'verified',
  });
  protected readonly actions: readonly ActionConfig[] = [
    { id: 'draft', label: 'Guardar borrador', variant: 'outline' },
    { id: 'send', label: 'Enviar resultado', variant: 'primary' },
  ];
  protected readonly requests = REQUESTS;
  protected readonly visibleRequests = computed(() => {
    const status = this.requestStatus();
    const term = this.search().trim().toLocaleLowerCase('es-MX');
    return this.requests.filter((request) => {
      const matchesStatus = !status || request.status === status;
      const matchesTerm =
        !term ||
        [request.folio, request.applicant, request.phone, request.address].some((value) =>
          value.toLocaleLowerCase('es-MX').includes(term),
        );
      return matchesStatus && matchesTerm;
    });
  });
  protected readonly personalDetails = PERSONAL_DETAILS;
  protected readonly declaredData = DECLARED_DATA;
  protected readonly columns = TABLE_COLUMNS;
  protected readonly rows = TABLE_ROWS;
  protected readonly steps = STEPS;
  protected readonly accordion = ACCORDION;
  protected readonly evidences = EVIDENCES;
  protected readonly differences = DIFFERENCES;
  protected readonly decisions = DECISIONS;
  protected selectField(value: VerificationChoice['value']): void {
    this.sampleField.update((field) => ({ ...field, selected: value }));
  }
}
