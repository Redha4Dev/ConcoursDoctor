import type { Role } from "../generated/identity";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        firstName: string;
        lastName: string;
      };
    }
    namespace Multer {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      interface File {}
    }
  }
}

export {};
