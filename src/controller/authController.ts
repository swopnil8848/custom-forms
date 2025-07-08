import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { AuthService } from "../service/authService";
import { createSendToken, signToken } from "../middleware/auth";
import bcrypt from "bcryptjs";
import { validate } from "class-validator";
import { signupUserDto } from "../dto/userDto/signupDto";
import { plainToClass } from "class-transformer";
import { Email } from "../utils/Email";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export class authController {
  static async health(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({
      status: "success",
      message: "Running..",
    });
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { email, password } = req.body;

      // Validate email and password
      if (!email) {
        return next(new AppError("Email field is required", 400));
      }

      if (!password) {
        return next(new AppError("Password field is required", 400));
      }

      // Find user by email
      const user = await AuthService.findByEmailWithPassword(email);

      // Check if user exists
      if (!user) {
        return next(new AppError("User Not Found", 404));
      }

      if (!user.isActive) {
        return next(new AppError("Cannot Login Account deactivated!"));
      }

      if (!user.isVerified) {
        return next(
          new AppError(
            "Email Not Verified. Please Verify Your Email First.",
            400
          )
        );
      }

      // Ensure user has a valid password field
      if (!user.password) {
        return next(
          new AppError(
            "User password is missing or invalid in the database",
            500
          )
        );
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: "fail",
          message: "The credentials don't match our records",
        });
      }

      createSendToken(user, 200, res);
    } catch (error) {
      return next(new AppError("Something went wrong during login", 500));
    }
  }

  static async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const userDto = plainToClass(signupUserDto, req.body);

    // Validate the DTO
    const errors = await validate(userDto);

    if (errors.length > 0) {
      return next(new AppError("Vallidatoin Failed", 400, errors));
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

      // Update the user object with the hashed password
      const userData = { ...req.body, password: hashedPassword };

      // Create the user in the database
      const user = await AuthService.createUser(userData);

      // change the url to frontend url while adding frontend
      const emailVerificationToken = signToken(user.id);

      const base_frontend_url =
        process.env.FRONTEND_URL || "https://emis.ekrasunya.com";

      const frontendUrl = req.get("origin") || base_frontend_url;
      const url = `${frontendUrl}/auth/verify-email/${emailVerificationToken}`;

      const email = new Email(
        { email: req.body.email, firstName: req.body.firstName },
        url
      );

      const response = await email.send({
        templateName: "signup",
        subject: "Verify Your Email!",
      });

      if (response.success === false) {
        return res.status(200).json({
          status: "fail",
          message: `Failed to send email to ${req.body.email}, please try again`,
          error: response.error,
        });
      }

      return res.status(201).json({
        status: "success",
        message: "Account Registered SUccessfully, \n Please Verify You email!",
        data: user,
      });
    } catch (error) {
      console.log("error:> ", error);
      return res
        .status(500)
        .json({ error: "Error creating user", details: error });
    }
  }

  static async verifyUserEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const emailVerificationToken = req.params.token;

    if (!emailVerificationToken) {
      return next(new AppError("INVALID EMAIL VERIFICATION TOKEN", 400));
    }

    const decoded = jwt.verify(
      emailVerificationToken,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload & { id: number };

    const user = await AuthService.findById(decoded.id);

    if (!user) {
      return next(new AppError("Invalid Verification Token!", 404));
    }

    AuthService.verifyEmail(user);

    return res.status(200).json({
      status: "success",
      data: user,
    });
  }

  static async me(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const user = req.user;

    if (!user) {
      return next(new AppError("Un-authorized! Please login first!", 401));
    }

    if (!user.isActive) {
      return next(
        new AppError(
          "Account Deactivated!, Please Contact EMIS team for more inquiry"
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }

  static async resendEmailVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const email = req.body.email;

    const user = await AuthService.findByEmail(email);

    if (!user) {
      return next(new AppError("User Not Found! Please Signup first"));
    }

    if (user.isVerified) {
      return next(
        new AppError(
          `${user.email} has already been verified! You can login to your account`
        )
      );
    }

    // change the url to frontend url while adding frontend
    const emailVerificationToken = signToken(user.id);
    const base_frontend_url =
      process.env.FRONTEND_URL || "https://emis.ekrasunya.com";

    const frontendUrl = req.get("origin") || base_frontend_url;
    const url = `${frontendUrl}/auth/verify-email/${emailVerificationToken}`;

    const sendEmail = new Email(
      { email: req.body.email, firstName: req.body.firstName },
      url
    );

    return res.status(200).json({
      status: "success",
      message: `Email Verificatin Sent to ${user.email} sucessfully`,
    });
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email;

    const resetToken = crypto.randomBytes(20).toString("hex");

    const frontendUrl = req.get("origin") || process.env.FRONTEND_URL || "http://localhost:5173";
    const url = `${frontendUrl}/reset-password/${resetToken}`;

    const user = await AuthService.forgotPassword(email, resetToken);

    if (!user) {
      return next(new AppError("User Not Found", 404));
    }

    const sendEmail = new Email(
      { email: req.body.email, firstName: user.firstName },
      url
    );

    await sendEmail.send({
      templateName: "forgotPassword",
      subject: "Reset Your Password!",
    });

    res.status(200).json({
      status: "success",
      message: `email has been sent to ${email}.`,
    });
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!resetToken) {
      return next(new AppError("Invalid Password Reset Token", 400));
    }

    // Password validation
    if (!password) {
      return next(new AppError("New password is required", 400));
    }

    if (typeof password !== "string") {
      return next(new AppError("New password must be a string", 400));
    }

    if (password.length < 8) {
      return next(
        new AppError("New password must be at least 8 characters long", 400)
      );
    }

    // Check password complexity using regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(
        new AppError(
          "Password must include uppercase, lowercase, number, and special character",
          400
        )
      );
    }

    const user = await AuthService.resetPassword(resetToken, password);
    createSendToken(user, 200, res);
  }
}
