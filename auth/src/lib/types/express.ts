import { LoggedUser } from '@ehalca/common';

export interface AuthRequest extends Request {
  user: LoggedUser;
}
