

export interface RegisterResponseDto {
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  token?: string;
}
