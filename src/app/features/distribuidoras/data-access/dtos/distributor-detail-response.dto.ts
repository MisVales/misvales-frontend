import { DistributorListItemResponseDto } from './distributor-list-item-response.dto';

// Detail may contain more info, but according to requirements it extends list item for now
export interface DistributorDetailResponseDto extends DistributorListItemResponseDto {
  // If backend returns origin info or similar, it goes here
  application_id?: string;
  evaluation_result?: string;
}
