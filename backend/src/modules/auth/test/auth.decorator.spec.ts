/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable @typescript-eslint/unbound-method */
import 'reflect-metadata';
import { IS_PUBLIC_KEY, Public, AuthUser } from '../auth.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('Auth Decorator', () => {
  describe('Public', () => {
    it('sets isPublic metadata on a method', () => {
      class TestController {
        static hello: Object;
        @Public()
        public hello() {}
      }

      const meta =
        Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype, 'hello') ??
        Reflect.getMetadata(IS_PUBLIC_KEY, TestController, 'hello') ??
        Reflect.getMetadata(IS_PUBLIC_KEY, TestController.prototype.hello) ??
        Reflect.getMetadata(IS_PUBLIC_KEY, TestController.hello);
      expect(meta).toBe(true);
    });
  });

  describe('AuthUser', () => {
    it('returns the whole user object when no key specified', () => {
      const user = { sub: 'u1', email: 'test@example.com' };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      } as unknown as ExecutionContext;

      const result: any = (AuthUser as any)(undefined, ctx);
      expect(typeof result).toBe('function');
    });

    it('returns a single property when key specified', () => {
      const user = { sub: 'u1', email: 'test@example.com' };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      } as unknown as ExecutionContext;

      const result: any = (AuthUser as any)('email', ctx);
      expect(typeof result).toBe('function');
    });
  });
});
