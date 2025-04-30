import { Role } from '../../users/schemas/user.schema';

export interface ITokenPayload {
  email: string;
  role: Role;
}
