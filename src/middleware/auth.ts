import { CookieOptions, NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthService } from "../service/authService";
import { User } from "../entities/User";

const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "90d";
let JWT_COOKIE_EXPIRES_IN: number = 1;
if (process.env.JWT_COOKIE_EXPIRES_IN) {
  JWT_COOKIE_EXPIRES_IN = parseInt(process.env.JWT_COOKIE_EXPIRES_IN);
}

const changedPasswordAfter = function (
  JWTTimestamp: number,
  passwordChangedAt: Date
): boolean {
  const changedTimeStamp = Math.floor(passwordChangedAt.getTime() / 1000); // Convert to seconds
  return JWTTimestamp < changedTimeStamp;
};

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      next(
        new AppError("you are not logged in! please log in to get acess", 401)
      );
      return;
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET as string
    ) as jwt.JwtPayload & { id: number };

    const freshUser = await AuthService.findById(decoded.id);

    if (!freshUser) {
      next(new AppError("In-Valid User", 401));
      return;
    }

    if (
      freshUser.passwordChangedAt &&
      changedPasswordAfter(decoded.iat as number, freshUser.passwordChangedAt)
    ) {
      next(
        new AppError("user recently changed password please log in again", 401)
      );
      return;
    }

    req.user = freshUser;
    next();
  }
);

export const verifyJWT = async (token: string): Promise<JwtPayload> => {
  let jwt_secret = JWT_SECRET || "";
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwt_secret, (err, decoded) => {
      if (err) {
        console.log("this is a error", err);
        return reject("Invalid or expired token. Please log in again.");
      } else {
        resolve(decoded as JwtPayload);
      }
    });
  });
};

export const signToken = (id: number): string => {
  const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ||
    "90d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: jwtExpiresIn,
  });
};

export const createSendToken = (
  user: User,
  statusCode: number,
  res: Response
) => {
  const token = signToken(user.id);

  const cookieOptions: CookieOptions = {
    maxAge: JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, // Persistent cookie
    httpOnly: true,
    secure: false, // Should be true in production
    sameSite: "lax",
  };

  // remove the password from the output
  const responseuser = { ...user, password: undefined };

  res.status(statusCode).json({
    status: "success",
    token,
    data: responseuser,
  });
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user?.role);
    if (!req.user) {
      return next(new AppError("You're not logged in Please login in first"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
