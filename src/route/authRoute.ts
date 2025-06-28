import { Router } from "express";
import { authController } from "../controller/authController";
import catchAsync from "../utils/catchAsync";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/health", catchAsync(authController.health));

router.post("/login", catchAsync(authController.login));
router.post("/signup", catchAsync(authController.createUser));
router.get("/me", protect, catchAsync(authController.me));

router.get("/verify-email/:token", catchAsync(authController.verifyUserEmail));
router.post(
  "/resend/email-verification",
  authController.resendEmailVerification
);
router.patch("/forgot-password", catchAsync(authController.forgotPassword));
router.patch(
  "/reset-password/:resetToken",
  catchAsync(authController.resetPassword)
);

export default router;
