
import fs from "fs/promises";
import path from "path";
import { execa } from "execa";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validatePrerequisites(): Promise<ValidationResult> {
  try {
    // Check Node.js version (minimum 18.x)
    const { stdout: nodeVersion } = await execa("node", ["--version"]);
    const majorVersion = parseInt(nodeVersion.replace("v", "").split(".")[0]);
    if (majorVersion < 18) {
      return {
        valid: false,
        error: `Node.js version ${nodeVersion} is not supported. Please use Node.js 18.x or higher.`,
      };
    }

    // Check npm
    try {
      await execa("npm", ["--version"]);
    } catch {
      return {
        valid: false,
        error: "npm is not installed or not available in PATH.",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate prerequisites: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function validateProjectName(
  projectName: string
): Promise<ValidationResult> {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(projectName)) {
    return {
      valid: false,
      error: `Project name contains invalid characters. Please use only letters, numbers, hyphens, and underscores.`,
    };
  }

  // Check if starts with a dot
  if (projectName.startsWith(".")) {
    return {
      valid: false,
      error: "Project name cannot start with a dot.",
    };
  }

  // Check if it's a reserved name
  const reservedNames = [
    "node_modules",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    ".git",
    ".next",
  ];
  if (reservedNames.includes(projectName.toLowerCase())) {
    return {
      valid: false,
      error: `"${projectName}" is a reserved name and cannot be used as a project name.`,
    };
  }

  return { valid: true };
}

export async function validateProjectDirectory(
  projectDir: string
): Promise<ValidationResult> {
  try {
    const stats = await fs.stat(projectDir).catch(() => null);
    if (stats) {
      if (stats.isDirectory()) {
        const files = await fs.readdir(projectDir);
        if (files.length > 0) {
          return {
            valid: false,
            error: `Directory "${path.basename(projectDir)}" already exists and is not empty. Please choose a different name or remove the existing directory.`,
          };
        }
      } else {
        return {
          valid: false,
          error: `"${path.basename(projectDir)}" exists but is not a directory.`,
        };
      }
    }
    return { valid: true };
  } catch (error) {
    // Directory doesn't exist, which is fine
    return { valid: true };
  }
}

export async function validateAll(
  projectName: string,
  projectDir: string
): Promise<ValidationResult> {
  // Validate prerequisites
  const prerequisites = await validatePrerequisites();
  if (!prerequisites.valid) {
    return prerequisites;
  }

  // Validate project name
  const nameValidation = await validateProjectName(projectName);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  // Validate project directory
  const dirValidation = await validateProjectDirectory(projectDir);
  if (!dirValidation.valid) {
    return dirValidation;
  }

  return { valid: true };
}

