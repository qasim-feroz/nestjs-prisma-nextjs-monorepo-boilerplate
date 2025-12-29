import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      // Use the JwtService without explicit secret - it uses the secret from module registration
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Try Authorization header first
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        // Remove any leading '=' that might have been incorrectly included
        return token.startsWith('=') ? token.substring(1) : token;
      }
    }
    
    // Fallback to cookie
    if (request.cookies?.token) {
      const cookieToken = request.cookies.token;
      // Remove any leading '=' that might have been incorrectly included
      return cookieToken.startsWith('=') ? cookieToken.substring(1) : cookieToken;
    }
    
    return undefined;
  }
}

