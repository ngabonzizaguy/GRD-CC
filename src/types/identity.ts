export type LmxIdentityStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type LmxIdentityItem = {
  identity_id: string;
  user_id: string;
  id_type: string;
  id_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: string;
  front_image_url: string;
  back_image_url: string;
  selfie_url: string;
  reject_reason: string;
  review_comment: string;
  created_at: number;
};
