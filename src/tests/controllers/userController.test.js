import { vi, describe, beforeEach, it, expect } from "vitest";
import * as userService from "../../services/User.js";
import {
  getUserController,
  updateUserController,
  softDeleteUserController,
  restoreUserController,
} from "../../controllers/userController.js";
import PrismaClient from "@prisma/client";

// Mock Prisma Client
vi.mock("@prisma/client", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

// Mock asyncWrapper to just pass the function for testing
vi.mock("../../utils/asyncWrapper.js", () => ({
  default: vi.fn((fn) => fn), // Mengmock default export
}));

// Mock convertToJson.js untuk menghindari logika asli
vi.mock("../../utils/convertToJson.js", () => ({
  default: vi.fn((data) => data), // Mengmock default export
}));

describe("User Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserController", () => {
    it("should return 200 and user data when user is found", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com" },
      ]; // Data mock untuk pengguna
      vi.spyOn(userService, "getUserServices").mockResolvedValue(mockUsers);

      const req = {}; // Tidak perlu query email karena mengambil semua pengguna
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getUserController(req, res);

      // Verifikasi apakah getUserServices dipanggil
      expect(userService.getUserServices).toHaveBeenCalled();

      // Verifikasi response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: mockUsers, // Sesuaikan dengan struktur data yang diharapkan
      });
    });

    it("should return 404 when no users are found", async () => {
      vi.spyOn(userService, "getUserServices").mockResolvedValue([]);

      const req = {}; // Tidak perlu query email karena mengambil semua pengguna
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await getUserController(req, res);

      // Verifikasi response ketika tidak ada pengguna
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No users found." });
    });
  });

  describe("updateUserController", () => {
    it("should return 200 and updated user data", async () => {
      const mockUser = {
        id: 1,
        name: "Updated Name",
        email: "updated@example.com",
      };
      vi.spyOn(userService, "updateUserService").mockResolvedValue(mockUser);

      const req = {
        params: { userId: "1" },
        body: { name: "Updated Name", email: "updated@example.com" },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await updateUserController(req, res);

      expect(userService.updateUserService).toHaveBeenCalledWith("1", {
        name: "Updated Name",
        email: "updated@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully",
        user: mockUser,
      });
    });

    it("should return 400 if no fields to update", async () => {
      const req = { params: { userId: "1" }, body: {} }; // Empty update
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await updateUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "At least one field (name, numberPhone, or email) is required",
      });
    });
  });

  describe("softDeleteUserController", () => {
    it("should return 200 and deleted user data", async () => {
      const mockUser = {
        id: 1,
        name: "Deleted User",
        email: "deleted@example.com",
      };
      vi.spyOn(userService, "softDeleteUserService").mockResolvedValue(
        mockUser
      );

      const req = { params: { userId: "1" } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await softDeleteUserController(req, res);

      expect(userService.softDeleteUserService).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully (soft delete)",
        user: mockUser,
      });
    });
  });

  describe("restoreUserController", () => {
    it("should return 200 and restored user data", async () => {
      const mockUser = {
        id: 1,
        name: "Restored User",
        email: "restored@example.com",
        deletedAt: new Date(),
      };
      vi.spyOn(userService, "findDeletedUser").mockResolvedValue(mockUser);
      vi.spyOn(userService, "restoreUser").mockResolvedValue(mockUser);

      const req = { params: { userId: "1" } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await restoreUserController(req, res);

      expect(userService.findDeletedUser).toHaveBeenCalledWith("1");
      expect(userService.restoreUser).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User restored successfully",
        user: mockUser,
      });
    });

    it("should return 400 if user is not deleted", async () => {
      const mockUser = {
        id: 1,
        name: "Active User",
        email: "active@example.com",
        deletedAt: null,
      };
      vi.spyOn(userService, "findDeletedUser").mockResolvedValue(mockUser);

      const req = { params: { userId: "1" } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await restoreUserController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User is not deleted or does not exist",
      });
    });
  });
});
