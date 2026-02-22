export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
}
