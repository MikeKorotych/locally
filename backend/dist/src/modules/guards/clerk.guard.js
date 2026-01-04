"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
let ClerkAuthGuard = class ClerkAuthGuard {
    clerk = (0, clerk_sdk_node_1.createClerkClient)({ secretKey: process.env.CLERK_API_KEY });
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if (typeof authHeader !== 'string' || !authHeader) {
            throw new common_1.UnauthorizedException('No Authorization header');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const session = await this.clerk.sessions.getSession(token);
            if (!session)
                throw new common_1.UnauthorizedException('Invalid token');
            const user = await this.clerk.users.getUser(session.userId);
            req.user = user;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = __decorate([
    (0, common_1.Injectable)()
], ClerkAuthGuard);
//# sourceMappingURL=clerk.guard.js.map