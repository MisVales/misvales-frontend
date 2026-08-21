import { DistributorListItemResponseDto } from './distributor-list-item-response.dto';

export interface DistributorDetailResponseDto extends DistributorListItemResponseDto {
  application_id?: string;
  evaluation_result?: string;
}
