import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    globals: false,
    env: {
      MONGODB_URI: "mongodb://localhost:27017/test",
      JWT_SECRET: "test-secret",
      ADMIN_EMAIL: "admin@test.com",
      ADMIN_PASSWORD: "test-password",
      CLOUDINARY_CLOUD_NAME: "test",
      CLOUDINARY_API_KEY: "test",
      CLOUDINARY_API_SECRET: "test",
    },
  },
});
