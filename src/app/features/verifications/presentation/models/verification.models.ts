export type VerificationStatus =
  | 'pending'
  | 'visiting'
  | 'evidence'
  | 'differences'
  | 'to-send'
  | 'completed'
  | 'no-differences'
  | 'review'
  | 'consultable'
  | 'required'
  | 'not-applicable';
export type Tone = 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'gray';
export interface DetailItem {
  readonly label: string;
  readonly value: string;
  readonly icon?: string;
}
export interface TableColumn {
  readonly key: string;
  readonly label: string;
  readonly width?: string;
}
export interface VerificationStep {
  readonly label: string;
  readonly description?: string;
  readonly state: 'completed' | 'active' | 'pending' | 'error';
}
export interface VerificationChoice {
  readonly value: 'verified' | 'difference' | 'not-applicable';
  readonly label: string;
}
export interface VerificationField {
  readonly name: string;
  readonly declaredValue: string;
  readonly selected?: VerificationChoice['value'];
}
export interface AccordionSection {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly status?: VerificationStatus;
  readonly differences?: number;
  readonly fields?: readonly VerificationField[];
}
export interface RequestItem {
  readonly folio: string;
  readonly applicant: string;
  readonly phone: string;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly estimatedTime: string;
  readonly status: VerificationStatus;
}
export interface EvidenceItem {
  readonly title: string;
  readonly fileName: string;
  readonly size: string;
  readonly kind: 'image' | 'pdf';
  readonly imageUrl?: string;
  readonly status?: VerificationStatus;
}
export interface DifferenceItem {
  readonly text: string;
  readonly severity?: 'warning' | 'error';
}
export interface DecisionOption {
  readonly value: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly tone: 'favorable' | 'unfavorable';
}
export interface ActionConfig {
  readonly id: string;
  readonly label: string;
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  readonly disabled?: boolean;
  readonly loading?: boolean;
}
export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
}
