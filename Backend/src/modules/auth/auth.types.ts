export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
