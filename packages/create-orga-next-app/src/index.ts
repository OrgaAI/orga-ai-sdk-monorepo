#!/usr/bin/env node

import { Command } from "commander";
import { execa } from "execa";
import chalk from "chalk";
import path from "path";
import { configureProject } from "./configureProject";
import { Logger } from "./utils/logger";
import { validateAll } from "./utils/validation";
import {
  installPackages,
  installShadCNPackages,
} from "./utils/install";
import {
  detectPackageManager,
  getCreateNextAppCommand,
  getRunCommand,
  type PackageManager,
} from "./utils/packageManager";

const program = new Command();

program
  .name("create-orga-next-app")
  .description("Bootstrap a Next.js project with our SDKs")
  .version("1.0.0")
  .argument("<project-name>", "Name of the new project directory")
  .option("--skip-build", "Skip building the project after setup", false)
  .option("--dry-run", "Show what would be done without actually doing it", false)
  .action(async (projectName: string, options) => {
    try {
      const { skipBuild, dryRun } = options;
      const sdkPackages = ["@orga-ai/react", "@orga-ai/node"];
      const shadCNPackages =  ["button", "label", "select", "slider", "textarea"]
        
      const projectDir = path.resolve(process.cwd(), projectName);

      // Detect package manager
      const packageManager = await detectPackageManager();
      Logger.banner();
      Logger.info(`Detected package manager: ${chalk.bold(packageManager)}`);

      Logger.section("Validation");
      Logger.info("Checking prerequisites and project setup...");

      const validation = await validateAll(projectName, projectDir);
      if (!validation.valid) {
        Logger.error(validation.error || "Validation failed");
        process.exit(1);
      }

      Logger.success("All validations passed!");

      if (dryRun) {
        Logger.warning("DRY RUN MODE - No changes will be made");
        Logger.info(`Would create project: ${projectName}`);
        Logger.info(`Would install packages: ${sdkPackages.join(", ")}`);
        if (shadCNPackages.length > 0) {
          Logger.info(`Would install ShadCN components: ${shadCNPackages.join(", ")}`);
        }
        Logger.info(`Would configure project files`);
        if (!skipBuild) {
          Logger.info(`Would build the project`);
        }
        return;
      }

      Logger.section("Creating Next.js Project");
      Logger.step(`Creating project: ${chalk.bold(projectName)}`);

      try {
        const { command, args } = getCreateNextAppCommand(packageManager, projectName);
        await execa(command, args, {
          stdio: "inherit",
        });
        Logger.success("Next.js project created successfully!");
      } catch (error) {
        Logger.error("Failed to create Next.js project");
        throw error;
      }

      if (shadCNPackages.length > 0) {
        Logger.section("Installing ShadCN UI Components");
        try {
          await installShadCNPackages(shadCNPackages, projectDir, { packageManager });
        } catch (error) {
          Logger.error("Failed to install ShadCN packages");
          throw error;
        }
      }

      Logger.section("Installing Dependencies");
      const additionalPackages = ["lucide-react"];
      const allPackages = [...sdkPackages, ...additionalPackages];

      try {
        await installPackages(allPackages, projectDir, { packageManager });
      } catch (error) {
        Logger.error("Failed to install packages");
        throw error;
      }

      Logger.section("Configuring Project");
      try {
        await configureProject(projectDir);
        Logger.success("Project configuration completed!");
      } catch (error) {
        Logger.error("Failed to configure project");
        throw error;
      }

      if (!skipBuild) {
        Logger.section("Building Project");
        Logger.startSpinner("Building Next.js project...");
        try {
          const [runCmd, ...runArgs] = getRunCommand(packageManager);
          await execa(runCmd, [...runArgs, "build"], {
            cwd: projectDir,
            stdio: "pipe",
          });
          Logger.stopSpinner(true, "Project built successfully!");
        } catch (error) {
          Logger.stopSpinner(false, "Build failed (this is non-critical)");
          const [runCmd] = getRunCommand(packageManager);
          Logger.warning(`Project was created but build failed. You can build it later with '${runCmd} run build'`);
        }
      }

      Logger.section("✨ Success!");
      Logger.success(
        `Project "${chalk.bold(projectName)}" has been bootstrapped successfully!`
      );
      console.log("\n");
      Logger.info("Next steps:");
      Logger.step(`cd ${chalk.bold(projectName)}`);
      const [runCmd] = getRunCommand(packageManager);
      Logger.step(`${runCmd} run dev`);
      console.log("\n");
      Logger.info("Don't forget to:");
      Logger.step("Add your Orga AI credentials to .env.local");
      Logger.step("Update ORGAAI_API_KEY and ORGAAI_USER_EMAIL");
      console.log("\n");
      Logger.info("Happy coding! 🚀\n");
    } catch (error) {
      Logger.error(
        `An error occurred: ${error instanceof Error ? error.message : String(error)}`
      );
      Logger.warning("If this persists, please check the error message above and try again.");
      process.exit(1);
    }
  });

program.parse();
