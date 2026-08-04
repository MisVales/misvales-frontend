export interface AssignDistributorCategoryRequestDto {
  category_version_id: string;
  starts_at?: string; // Optional if immediate
  reason: string;
}
