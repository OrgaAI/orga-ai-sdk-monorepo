# Orga AI Next.js CLI

A CLI tool for bootstrapping Next.js projects with Orga AI SDKs, ShadCN UI components, and pre-configured setup files.

## Overview

The `@orga-ai/create-orga-next-app` CLI tool automates the creation of a Next.js project with:
- Orga AI React and Node.js SDKs (`@orga-ai/react`, `@orga-ai/node`)
- ShadCN UI components (Button, Label, Select, Slider, Textarea)
- Pre-configured project files (API routes, providers, environment setup)
- Example playground page showcasing Orga AI features

## How It Works

The CLI follows this workflow:

1. **Validation** - Checks prerequisites (Node.js ≥18, npm) and validates project name/directory
2. **Project Creation** - Runs `create-next-app` to scaffold a new Next.js project
3. **ShadCN Installation** - Installs ShadCN UI components sequentially
4. **Package Installation** - Installs Orga AI SDKs and additional dependencies (lucide-react)
5. **Project Configuration** - Generates and writes project files:
   - `app/page.tsx` - Orga AI Playground component
   - `app/layout.tsx` - Root layout with OrgaProvider
   - `app/providers/OrgaProvider.tsx` - Orga AI React provider
   - `app/api/route.ts` - API route handler
   - `.env.local` - Environment variables template
   - `README.md` - Project-specific documentation
6. **Build** (optional) - Optionally builds the project to verify setup

## Project Structure

```
orga-next-cli/
├── src/
│   ├── index.ts                 # CLI entry point and command handler
│   ├── configureProject.ts      # Project file generation logic
│   ├── screens/                 # Template content for generated files
│   │   ├── Home.ts             # Playground page component
│   │   ├── layout.ts           # Root layout component
│   │   ├── Provider.ts         # OrgaProvider component
│   │   ├── API.ts              # API route handler
│   │   ├── EnvFile.ts          # Environment variables template
│   │   └── README.ts           # Generated project README
│   └── utils/
│       ├── logger.ts           # Console logging utilities
│       ├── spinner.ts          # Loading spinner implementation
│       ├── validation.ts       # Prerequisites and input validation
│       └── install.ts           # Package installation utilities
├── dist/                        # Compiled JavaScript output
├── package.json
└── tsconfig.json
```

## Development

### Prerequisites

- Node.js 18.x or higher
- npm (comes with Node.js)
- TypeScript knowledge

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development mode (runs TypeScript directly):**
   ```bash
   npm run dev <project-name>
   ```
   This uses `tsx` to run TypeScript directly without compilation.

3. **Build for production:**
   ```bash
   npm run build
   ```
   Compiles TypeScript to JavaScript in the `dist/` directory.

4. **Test the CLI locally:**
   ```bash
   # Link the package globally
   npm link
   
   # Now you can use it anywhere
   create-orga-next-app my-test-project
   
   # Or test with the built version
   node dist/index.js my-test-project
   ```

### Making Changes

#### Adding New Generated Files

1. Create a new template file in `src/screens/` (e.g., `NewFile.ts`)
2. Export a constant with the file content (string template)
3. Import and use it in `src/configureProject.ts`
4. Add the file writing logic in `configureProject()`

Example:
```typescript
// src/screens/NewFile.ts
export const newFileContent = `// Your file content here`;

// src/configureProject.ts
import { newFileContent } from './screens/NewFile';

// In configureProject function:
const newFilePath = path.join(projectDir, 'path/to/new-file.ts');
await fs.writeFile(newFilePath, newFileContent);
Logger.success('Created path/to/new-file.ts');
```

#### Modifying Generated Content

- Edit the template files in `src/screens/`
- Changes will be reflected in newly generated projects
- Existing projects are not affected (they're already generated)

#### Adding New Packages

1. Update the `sdkPackages` array in `src/index.ts` (around line 27)
2. Or add to `additionalPackages` array (around line 90)
3. For ShadCN components, update `shadCNPackages` array (around line 29)

#### Adding Validation Rules

1. Add validation functions in `src/utils/validation.ts`
2. Call them in `validateAll()` function
3. Return `ValidationResult` with `valid: boolean` and optional `error: string`

#### Modifying CLI Options

Edit the command definition in `src/index.ts`:
```typescript
program
  .option("--new-option", "Description of new option", false)
  .action(async (projectName: string, options) => {
    const { newOption } = options;
    // Use the option
  });
```

## Testing

### Manual Testing Workflow

1. **Test in development mode:**
   ```bash
   npm run dev test-project
   ```

2. **Test with dry-run (no changes made):**
   ```bash
   npm run dev test-project -- --dry-run
   ```

3. **Test with skip-build:**
   ```bash
   npm run dev test-project -- --skip-build
   ```

4. **Test the built version:**
   ```bash
   npm run build
   node dist/index.js test-project
   ```

5. **Verify generated project:**
   ```bash
   cd test-project
   npm run dev
   # Check that the playground works at http://localhost:3000
   ```

### Testing Checklist

- [ ] Project name validation (invalid characters, reserved names)
- [ ] Directory validation (existing, non-empty directories)
- [ ] Prerequisites validation (Node.js version, npm)
- [ ] All files are generated correctly
- [ ] Packages install successfully
- [ ] ShadCN components install correctly
- [ ] Generated project builds successfully
- [ ] Generated project runs in dev mode
- [ ] Dry-run mode works (no actual changes)
- [ ] Skip-build option works
- [ ] Error handling for failed operations

### Common Test Scenarios

```bash
# Test with invalid project name
npm run dev "invalid/name"

# Test with existing directory
mkdir existing-dir
npm run dev existing-dir

# Test with dry-run
npm run dev test-project -- --dry-run

# Test skip-build
npm run dev test-project -- --skip-build
```

## Building and Publishing

### Build

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Publishing (Internal)

If this package is published to an internal npm registry:

1. **Update version in `package.json`**
2. **Build the project:**
   ```bash
   npm run build
   ```
3. **Publish:**
   ```bash
   npm publish --registry=<your-internal-registry>
   ```

### Using the Published Package

Once published, users can install and use it:

```bash
npx @orga-ai/create-orga-next-app my-project
```

## Dependencies

### Runtime Dependencies

- `chalk` - Terminal string styling
- `commander` - CLI framework for parsing commands and options
- `execa` - Better process execution for running shell commands

### Development Dependencies

- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution for development
- `@types/node` - TypeScript definitions for Node.js

## Troubleshooting

### Common Issues

**"Node.js version is not supported"**
- Ensure Node.js 18.x or higher is installed
- Check with `node --version`

**"npm is not installed"**
- npm comes with Node.js, ensure Node.js is properly installed
- Check with `npm --version`

**"Directory already exists and is not empty"**
- Choose a different project name
- Or remove/empty the existing directory

**"Failed to create Next.js project"**
- Check internet connection (create-next-app downloads templates)
- Ensure you have write permissions in the current directory

**"Failed to install packages"**
- Check internet connection
- Verify npm registry is accessible
- Check for conflicting package versions

**"Failed to install ShadCN components"**
- ShadCN requires Tailwind CSS setup (should be handled by create-next-app)
- Ensure the project was created successfully first

**Build fails after project creation**
- This is non-critical - the project is still usable
- Can build manually later with `npm run build` in the project directory
- Check for TypeScript or configuration errors

### Debug Mode

For more verbose output, you can modify the logger or add console.log statements in development:

```typescript
// In src/index.ts or other files
console.log('Debug info:', { projectName, projectDir, options });
```

## Architecture Notes

### File Generation

The CLI uses template strings stored as constants in `src/screens/`. These are written directly to the generated project, so they must be valid TypeScript/TSX code as strings.

### Error Handling

- Validation errors exit early with clear messages
- Runtime errors are caught and logged with helpful context
- Non-critical errors (like build failures) are logged as warnings but don't fail the entire process

### Logging

The `Logger` utility provides:
- Section headers for visual separation
- Spinners for long-running operations
- Color-coded messages (info, success, error, warning)
- Consistent formatting across the CLI

### Package Installation

- SDK packages are installed in parallel for performance
- ShadCN packages are installed sequentially (they may have dependencies)
- Uses `--legacy-peer-deps` flag for npm to handle peer dependency conflicts

## Contributing

When making changes:

1. Test locally with `npm run dev`
2. Test the built version with `npm run build && node dist/index.js`
3. Verify the generated project works correctly
4. Update this README if you add new features or change workflows
5. Ensure error messages are clear and helpful


