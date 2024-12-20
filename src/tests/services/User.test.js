import { vi, describe, beforeEach, it, expect } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// Mock Prisma Client
vi.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

// Import functions to test
import {
  findUserByEmail,
  createUser,
  updateUserOtp,
  comparePassword,
  generateToken,
  verifyToken,
  updatePassword,
} from "../../services/User.js";

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test for findUserByEmail
  describe("findUserByEmail", () => {
    it("should return user data when email exists", async () => {
      const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await findUserByEmail("john@example.com");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when email does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await findUserByEmail("nonexistent@example.com");

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
      expect(result).toBeNull();
    });
  });

  // Test for createUser
  describe("createUser", () => {
    it("should create a new user and return user data", async () => {
      const mockUser = { id: 1, name: "Jane Doe", email: "jane@example.com" };
      prisma.user.create.mockResolvedValue(mockUser);

      const userData = {
        name: "Jane Doe",
        email: "jane@example.com",
        numberPhone: "987654321",
        password: "hashedpassword",
      };

      const result = await createUser(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
      expect(result).toEqual(mockUser);
    });
  });

  // Test for updateUserOtp
  describe("updateUserOtp", () => {
    it("should update user OTP and expiry", async () => {
      const mockUpdatedUser = {
        id: 1,
        otp: "123456",
        otpExpiry: new Date("2024-12-31T23:59:59Z"),
      };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const userId = 1;
      const otpData = {
        otp: "123456",
        otpExpiry: new Date("2024-12-31T23:59:59Z"),
      };

      const result = await updateUserOtp(userId, otpData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: otpData,
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  // Test for comparePassword
  describe("comparePassword", () => {
    it("should return true for matching passwords", async () => {
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await comparePassword("plainPassword", "hashedPassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plainPassword",
        "hashedPassword"
      );
      expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false);

      const result = await comparePassword(
        "plainPassword",
        "wrongHashedPassword"
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plainPassword",
        "wrongHashedPassword"
      );
      expect(result).toBe(false);
    });
  });

  // Test for generateToken
  describe("generateToken", () => {
    it("should generate a JWT token for the user", () => {
      const mockToken = "mock.jwt.token";
      vi.spyOn(jwt, "sign").mockReturnValue(mockToken);

      const user = { id: 1 };
      const result = generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(result).toBe(mockToken);
    });
  });

  // Test for verifyToken
  describe("verifyToken", () => {
    it("should verify and decode a valid JWT token", () => {
      const mockDecoded = { id: 1 };
      vi.spyOn(jwt, "verify").mockReturnValue(mockDecoded);

      const result = verifyToken("valid.jwt.token");

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid.jwt.token",
        process.env.JWT_SECRET
      );
      expect(result).toEqual(mockDecoded);
    });

    it("should throw an error for an invalid JWT token", () => {
      vi.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyToken("invalid.jwt.token")).toThrow("Invalid token");
    });
  });

  // Test for updatePassword
  describe("updatePassword", () => {
    it("should update user password", async () => {
      const mockUpdatedUser = { id: 1, password: "newHashedPassword" };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await updatePassword(1, "newHashedPassword");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: "newHashedPassword" },
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });
});
