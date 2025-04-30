import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { Role } from '../../users/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<Role[]>(ROLES_KEY, ctx.getHandler());
    if (!required) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user.role);
  }
}
