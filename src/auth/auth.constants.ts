export const jwtConstants = {
  secret: 'LoveATS,msChau', // secret key
};

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
  GITHUB = 'github',
}

export enum Role {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}
