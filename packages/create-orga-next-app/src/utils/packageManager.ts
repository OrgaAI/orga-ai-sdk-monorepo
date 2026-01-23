import { execa } from "execa";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

/**
 * Detects which package manager is being used based on how the CLI was invoked.
 * This matches create-next-app's behavior:
 * - npx create-next-app -> npm
 * - yarn create next-app -> yarn
 * - pnpm create next-app -> pnpm
 * - bunx create-next-app -> bun
 */
export async function detectPackageManager(): Promise<PackageManager> {
  // Check how the CLI was invoked by looking at the process
  const processName = process.argv[0] || "";
  const processPath = process.env.npm_execpath || "";
  
  // Check for bunx/bun
  if (
    processName.includes("bun") ||
    processPath.includes("bun") ||
    process.env.BUN
  ) {
    try {
      await execa("bun", ["--version"], { stdio: "pipe" });
      return "bun";
    } catch {
      // Bun not available, fall through
    }
  }

  // Check for pnpm
  if (processPath.includes("pnpm")) {
    try {
      await execa("pnpm", ["--version"], { stdio: "pipe" });
      return "pnpm";
    } catch {
      // pnpm not available
    }
  }

  // Check for yarn
  if (processPath.includes("yarn")) {
    try {
      await execa("yarn", ["--version"], { stdio: "pipe" });
      return "yarn";
    } catch {
      // yarn not available
    }
  }

  // Default to npm (for npx or direct node execution)
  return "npm";
}

/**
 * Gets the install command for a package manager
 */
export function getInstallCommand(pm: PackageManager): string[] {
  switch (pm) {
    case "bun":
      return ["bun", "add"];
    case "pnpm":
      return ["pnpm", "add"];
    case "yarn":
      return ["yarn", "add"];
    case "npm":
    default:
      return ["npm", "install"];
  }
}

/**
 * Gets the run command for a package manager
 */
export function getRunCommand(pm: PackageManager): string[] {
  switch (pm) {
    case "bun":
      return ["bun", "run"];
    case "pnpm":
      return ["pnpm", "run"];
    case "yarn":
      return ["yarn"];
    case "npm":
    default:
      return ["npm", "run"];
  }
}

/**
 * Gets the exec command for a package manager (for npx/bunx/etc)
 */
export function getExecCommand(pm: PackageManager): string[] {
  switch (pm) {
    case "bun":
      return ["bunx"];
    case "pnpm":
      return ["pnpm", "dlx"];
    case "yarn":
      return ["yarn", "dlx"];
    case "npm":
    default:
      return ["npx"];
  }
}

/**
 * Gets the create-next-app command for a package manager
 * This matches how create-next-app expects to be invoked
 */
export function getCreateNextAppCommand(
  pm: PackageManager,
  projectName: string
): { command: string; args: string[] } {
  switch (pm) {
    case "bun":
      return {
        command: "bunx",
        args: ["create-next-app@latest", projectName, "--yes"],
      };
    case "pnpm":
      return {
        command: "pnpm",
        args: ["create", "next-app", projectName, "--yes"],
      };
    case "yarn":
      return {
        command: "yarn",
        args: ["create", "next-app", projectName, "--yes"],
      };
    case "npm":
    default:
      return {
        command: "npx",
        args: ["create-next-app@latest", projectName, "--yes"],
      };
  }
}

