import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import ejs from "ejs";
import path from "path";

import app from "../../index.js";
import Email from "../../config/mail/nodemailer.js";
import {
  createUser,
  updateUserOtp,
  findUserById,
  findUserByEmail,
  comparePassword,
  generateToken,
  verifyToken,
  updatePassword,
} from "../../services/User.js";

vi.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});
const prisma = new PrismaClient();

vi.mock("bcrypt");
vi.mock("ejs");
vi.mock("path");
vi.mock("../../config/mail/nodemailer.js");
vi.mock("../../services/User.js");

describe("Auth Controller - registerController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        numberPhone: "1234567890",
        password: "hashedpassword",
      };

      findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedpassword");
      createUser.mockResolvedValue(mockUser);
      updateUserOtp.mockResolvedValue({
        ...mockUser,
        otp: "123456",
        otpExpiry: new Date(),
      });
      ejs.renderFile.mockResolvedValue("<html>OTP: 123456</html>");
      Email.mockResolvedValue(true);

      const response = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        numberPhone: "1234567890",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered");
      expect(response.body.user).toHaveProperty("id", 1);
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(createUser).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        numberPhone: "1234567890",
        password: "hashedpassword",
      });
      expect(updateUserOtp).toHaveBeenCalledWith(1, expect.any(Object));
      expect(ejs.renderFile).toHaveBeenCalledWith(
        path.join(process.cwd(), "./src/views/emails/otp.ejs"),
        { otp: expect.any(String) }
      );
      expect(Email).toHaveBeenCalledWith(
        "john@example.com",
        "Your OTP Code",
        expect.any(String)
      );
    });

    it("should return an error if email is already in use", async () => {
      findUserByEmail.mockResolvedValue({ id: 1, email: "john@example.com" });

      const response = await request(app).post("/api/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        numberPhone: "1234567890",
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Email is already in use.");
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        verifiedAt: new Date(),
      };

      findUserByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue("mockToken");

      const response = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.user).toHaveProperty("id", 1);
      expect(response.body.token).toBe("mockToken");
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(generateToken).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should return an error if email is not found", async () => {
      findUserByEmail.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password.");
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
    });

    it("should return an error if OTP is not verified", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        verifiedAt: null,
      };

      findUserByEmail.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Please verify your account before logging in."
      );
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
    });

    it("should return an error if password is invalid", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        verifiedAt: new Date(),
      };

      findUserByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password.");
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("should verify OTP successfully", async () => {
      const mockUser = {
        id: 1,
        otp: "123456",
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        otp: null,
        otpExpiry: null,
        verifiedAt: new Date(),
      });

      const response = await request(app).post("/api/auth/verify-otp").send({
        userId: 1,
        otp: "123456",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("OTP verified successfully.");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          otp: null,
          otpExpiry: null,
          verifiedAt: expect.any(Date),
        },
      });
    });

    it("should return an error if user is not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/verify-otp").send({
        userId: 1,
        otp: "123456",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found.");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return an error if OTP is invalid", async () => {
      const mockUser = {
        id: 1,
        otp: "654321",
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/verify-otp").send({
        userId: 1,
        otp: "123456",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid OTP.");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return an error if OTP has expired", async () => {
      const mockUser = {
        id: 1,
        otp: "123456",
        otpExpiry: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/verify-otp").send({
        userId: 1,
        otp: "123456",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("OTP has expired.");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("POST /api/auth/reset-otp", () => {
    it("should reset OTP successfully", async () => {
      const mockUser = {
        id: 1,
        email: "john@example.com",
      };

      findUserById.mockResolvedValue(mockUser);
      updateUserOtp.mockResolvedValue({
        ...mockUser,
        otp: "123456",
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      });
      ejs.renderFile.mockResolvedValue("<html>OTP: 123456</html>");
      Email.mockResolvedValue(true);

      const response = await request(app).post("/api/auth/reset-otp").send({
        userId: 1,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "OTP has been reset and sent to your email"
      );
      expect(findUserById).toHaveBeenCalledWith(1);
      expect(updateUserOtp).toHaveBeenCalledWith(1, expect.any(Object));
      expect(ejs.renderFile).toHaveBeenCalledWith(
        path.join(process.cwd(), "./src/views/emails/otp.ejs"),
        { otp: expect.any(String) }
      );
      expect(Email).toHaveBeenCalledWith(
        "john@example.com",
        "Your OTP Code",
        expect.any(String)
      );
    });

    it("should return an error if userId is not provided", async () => {
      const response = await request(app).post("/api/auth/reset-otp").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User ID is required");
    });

    it("should return an error if user is not found", async () => {
      findUserById.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/reset-otp").send({
        userId: 1,
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
      expect(findUserById).toHaveBeenCalledWith(1);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send reset password email successfully", async () => {
      const mockUser = {
        id: 1,
        email: "john@example.com",
      };

      findUserByEmail.mockResolvedValue(mockUser);
      generateToken.mockReturnValue("mockResetToken");
      ejs.renderFile.mockResolvedValue("<html>Reset Link</html>");
      Email.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: "john@example.com",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Reset password email sent");
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
      expect(generateToken).toHaveBeenCalledWith(expect.any(Object));
      expect(ejs.renderFile).toHaveBeenCalledWith(
        path.join(
          process.cwd(),
          "./src/views/emails/forgot-password-email.ejs"
        ),
        { resetLink: expect.any(String) }
      );
      expect(Email).toHaveBeenCalledWith(
        "john@example.com",
        "Reset Password",
        expect.any(String)
      );
    });

    it("should return an error if user is not found", async () => {
      findUserByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: "john@example.com",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
      expect(findUserByEmail).toHaveBeenCalledWith("john@example.com");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset password successfully", async () => {
      const mockUser = {
        id: 1,
        email: "john@example.com",
      };

      const mockToken = "mockToken";
      const mockNewPassword = "newPassword123";
      const mockHashedPassword = "hashedNewPassword123";

      verifyToken.mockReturnValue({ id: 1 });
      bcrypt.hash.mockResolvedValue(mockHashedPassword);
      updatePassword.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: mockToken,
          newPassword: mockNewPassword,
          confirmPassword: mockNewPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password updated successfully");
      expect(verifyToken).toHaveBeenCalledWith(mockToken);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockNewPassword, 10);
      expect(updatePassword).toHaveBeenCalledWith(1, mockHashedPassword);
    });

    it("should return an error if token, newPassword, or confirmPassword is missing", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "",
          newPassword: "newPassword123",
          confirmPassword: "newPassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
    });

    it("should return an error if passwords do not match", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "mockToken",
          newPassword: "newPassword123",
          confirmPassword: "differentPassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation error");
    });

    it("should return an error if token is invalid", async () => {
      verifyToken.mockReturnValue(null);

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalidToken",
          newPassword: "newPassword123",
          confirmPassword: "newPassword123",
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Invalid token payload");
      expect(verifyToken).toHaveBeenCalledWith("invalidToken");
    });
  });
});
