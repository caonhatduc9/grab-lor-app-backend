interface AuthResponse {
  statusCode: number;
  data: {
    userId: number;
    access_token: string;
    userName: string;
    avatarURL: string;
    payment: 'free' | 'paid';
  };
}
