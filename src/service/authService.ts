import { AppDataSource } from "../database/database";
import { User } from "../entities/User";
import AppError from "../utils/AppError";
import bcrypt from "bcryptjs";

export class AuthService {
  private static userRepository = AppDataSource.getRepository(User);

  static async createUser(data: Partial<User>) {
    const newUser = this.userRepository.create(data);
    return await this.userRepository.save(newUser);
  }

  static async findByEmailWithPassword(email: string) {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password") // Include the password field explicitly
      .where("user.email = :email", { email })
      .getOne();

    return user;
  }
  static async findById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  static async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  static async verifyEmail(user: User): Promise<User> {
    user.isVerified = true;
    user.emailVerificationToken = null;
    return await this.userRepository.save(user);
  }

  static async forgotPassword(email: string, resetToken: string) {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      throw new AppError("User Not Found!", 404);
    }

    user.passwordResetToken = resetToken;
    user.passwordChangedAt = new Date();
    user.isVerified = true;

    await this.userRepository.save(user);

    return user;
  }

  static async resetPassword(passwordResetToken: string, password: string) {
    // Find the user by the reset token
    const user = await this.userRepository.findOne({
      where: { passwordResetToken },
    });

    if (!user) {
      throw new AppError("Invalid or expired password reset token", 400);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and remove the reset token
    user.password = hashedPassword;
    user.passwordResetToken = null; // Remove the token after resetting
    user.isVerified = true;

    await this.userRepository.save(user); // Save changes

    return user;
  }
}
