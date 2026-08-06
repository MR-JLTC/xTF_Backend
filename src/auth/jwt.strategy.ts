import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "SECRET_KEY_REPLACE_IN_PROD", // Must match the secret in auth.module
    });
  }

  async validate(payload: any) {
    // This payload is the decoded JWT
    const user = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // The returned value will be attached to the request object as `req.user`
    // Use `user_id` to match the rest of the codebase which expects req.user.user_id
    return { user_id: payload.sub, email: payload.email, name: payload.name };
  }
}
