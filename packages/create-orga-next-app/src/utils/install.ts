import { execa } from "execa";
import { Logger } from "./logger";
import { getInstallCommand, type PackageManager } from "./packageManager";

export async function installPackages(
  packages: string[],
  projectDir: string,
  options: { silent?: boolean; packageManager?: PackageManager } = {}
): Promise<void> {
  if (packages.length === 0) return;

  const pm = options.packageManager || "npm";
  const [cmd, ...baseArgs] = getInstallCommand(pm);
  
  // Build the install args based on package manager
  const installArgs = [...baseArgs, ...packages];
  
  // Add npm-specific flags
  if (pm === "npm") {
    installArgs.push("--legacy-peer-deps");
  }

  try {
    Logger.startSpinner(`Installing ${packages.length} package(s) with ${pm}...`);
    
    await execa(cmd, installArgs, {
      cwd: projectDir,
      stdio: "pipe",
    });

    Logger.stopSpinner(true, `Installed ${packages.length} package(s) successfully`);
  } catch (error) {
    Logger.stopSpinner(false, "Failed to install packages");
    throw new Error(
      `Failed to install packages: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function installShadCNPackages(
  packages: string[],
  projectDir: string,
  options: { packageManager?: PackageManager } = {}
): Promise<void> {
  if (packages.length === 0) return;

  const pm = options.packageManager || "npm";
  const { getExecCommand } = await import("./packageManager");
  const [execCmd, ...execArgs] = getExecCommand(pm);

  Logger.info(`Installing ${packages.length} ShadCN component(s) with ${pm}...`);
  console.log(); // Add spacing before shadcn output

  // Install ShadCN packages sequentially as they may have dependencies
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const progress = `[${i + 1}/${packages.length}]`;
    
    try {
      Logger.step(`${progress} Installing ${pkg}...`);
      // shadcn uses npx/bunx/dlx, so we use the exec command
      // Build the command: bunx shadcn@latest add <pkg> --yes
      // or: npx shadcn@latest add <pkg> --yes
      // or: pnpm dlx shadcn@latest add <pkg> --yes
      const shadcnArgs = execArgs.length > 0
        ? [...execArgs, "shadcn@latest", "add", pkg, "--yes"]
        : ["shadcn@latest", "add", pkg, "--yes"];
      
      await execa(execCmd, shadcnArgs, {
        cwd: projectDir,
        stdio: "inherit",
      });
      Logger.success(`${progress} ${pkg} installed successfully`);
      console.log(); // Add spacing after each component
    } catch (error) {
      Logger.error(`${progress} Failed to install ${pkg}`);
      throw new Error(
        `Failed to install ShadCN component "${pkg}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  Logger.success(`Installed ${packages.length} ShadCN component(s) successfully`);
}

