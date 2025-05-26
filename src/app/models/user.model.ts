export interface User {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthYear?: number;
  phoneNumber?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  avatarUrl?: string;
}
