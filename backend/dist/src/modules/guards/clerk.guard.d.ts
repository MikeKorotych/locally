import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class ClerkAuthGuard implements CanActivate {
    private clerk;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
