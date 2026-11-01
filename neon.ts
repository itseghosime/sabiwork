import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  preview: {
    realtime: {
      allowedOrigins: [
        "http://localhost:3000",
        "http://localhost:41873",
        "https://sabiwork-git-feat-neon-fu-c7cd38-itseghosime-codebases-projects.vercel.app",
        "https://sabiwork-beta.vercel.app",
      ],
    },
  },
  auth: true,
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
