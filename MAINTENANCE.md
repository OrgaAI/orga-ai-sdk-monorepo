# Orga SDK Monorepo – Internal Maintenance Guide

This document is for the internal team. It covers best practices for versioning, publishing, and maintaining the Orga SDK monorepo using semantic-release.

---

## Table of Contents
- [Prerequisite: Configure .npmrc for npm Access](#prerequisite-configure-npmrc-for-npm-access)
- [Branch Strategy](#branch-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Development Workflow](#development-workflow)
- [Release Process](#release-process)
- [Common Pitfalls](#common-pitfalls)
- [Manual Publishing (Legacy)](#manual-publishing-legacy)

---

## Prerequisite: Configure .npmrc for npm Access

Before you can publish or install @orga-ai npm packages, you must configure authentication with the npm registry. This is required for both private and public package access.

**Follow these steps:**

1. **Create a `.npmrc` file in the project root (if it doesn't exist):**
   - This file tells npm (and pnpm) how to authenticate with the registry for the @orga-ai scope.
   - Add file to .gitignore.

2. **Obtain an npm access token:**
   - Generate a new token from your npm account settings, or ask for a valid token.
   - The token should have at least "publish" and "read" permissions for the relevant packages.

3. **Add the following lines to your `.npmrc` file:**
   ```ini
   @orga-ai:registry=https://registry.npmjs.org/
   //registry.npmjs.org/:_authToken=${NPM_TOKEN}
   ```
   - Replace `${NPM_TOKEN}` with your actual token, or set it as an environment variable for security.
   - Example (not recommended for committed files):
     ```ini
     //registry.npmjs.org/:_authToken=your-actual-token-here
     ```

**Note:**
- Never commit your real npm token to version control.
- You can set `NPM_TOKEN` in your shell environment or CI/CD secrets for safety.
- This setup is required for all publishing and installing of private @orga-ai packages.

---

## Branch Strategy

We use a three-tier branch strategy with automated semantic-release:

```
main (production) ← dev (staging) ← feature/* (development)
```

### **Branch Purposes:**

- **`main`**: Production releases with `latest` tag
- **`dev`**: Staging releases with `beta` tag  
- **`feature/*`**: Development branches (no releases)
- **`ci-cd/test`**: Testing releases with `test` tag

---

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

### **Commit Types:**
- **`feat:`** - New features (minor version bump)
- **`fix:`** - Bug fixes (patch version bump)
- **`docs:`** - Documentation changes (no version bump)
- **`style:`** - Code style changes (no version bump)
- **`refactor:`** - Code refactoring (no version bump)
- **`test:`** - Adding tests (no version bump)
- **`chore:`** - Maintenance tasks (no version bump)
- **`BREAKING CHANGE:`** - Breaking changes (major version bump) - **must be in footer**

### **Examples:**
```bash
git commit -m "feat: add user authentication component"
git commit -m "fix: resolve login form validation bug"
git commit -m "docs: update installation instructions"

# Breaking changes must be in the footer (after a blank line)
git commit -m "perf: remove deprecated API methods

BREAKING CHANGE: The deprecated API methods have been removed.
Use the new API methods instead for better performance."
```

---

## Development Workflow

### **1. Start Feature Development:**
```bash
# Always start from dev branch
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Work on your feature...
git commit -m "feat: add new component"
git commit -m "fix: resolve bug in component"
```

### **2. Create Pull Request:**
```bash
git push origin feature/your-feature-name
# Create PR: feature/your-feature-name → dev
```

### **3. Merge to Dev:**
- **Automatically triggers**: Beta release with `beta` tag
- **Example**: `1.2.0-beta.1`
- **Available**: `npm install @orga-ai/sdk-react-native@beta`

### **4. Production Release:**
```bash
# When ready for production
# Create PR: dev → main
# Merge triggers production release with `latest` tag
# Example: 1.2.0
```

---

## Release Process

### **Automated Releases:**

1. **Beta Releases** (dev branch):
   - Trigger: Merge to `dev`
   - Tag: `beta`
   - Version: `1.2.0-beta.1`, `1.2.0-beta.2`, etc.

2. **Production Releases** (main branch):
   - Trigger: Merge `dev` to `main`
   - Tag: `latest`
   - Version: `1.2.0`, `1.3.0`, etc.

3. **Test Releases** (ci-cd/test branch):
   - Trigger: Push to `ci-cd/test`
   - Tag: `test`
   - Version: `1.2.0-test.1`, etc.

### **What Happens Automatically:**
- ✅ Version bump based on commit types
- ✅ Changelog generation
- ✅ Git tag creation
- ✅ npm package publishing
- ✅ Release commit creation

### **Manual Steps:**
- Pull changes after release: `git pull origin <branch> && git fetch --tags`

---

## Common Pitfalls

- **Wrong commit messages**: Use conventional commit format for automatic versioning
- **Starting from wrong branch**: Always start feature branches from `dev`
- **Forgetting to pull**: Always pull latest `dev` before starting new features
- **Breaking changes**: Use `BREAKING CHANGE:` prefix for major version bumps
- **Missing npm token**: Ensure `NPM_TOKEN` is set in GitHub secrets

---

## Manual Publishing (Legacy)

**Note**: These scripts are kept for manual publishing if needed, but semantic-release handles this automatically.

### **Version Bumping Scripts:**
```bash
# Test prereleases
pnpm run bump-native-test
pnpm run bump-web-test

# Alpha prereleases  
pnpm run bump-native-alpha
pnpm run bump-web-alpha

# Production releases
pnpm run bump-native-release
pnpm run bump-web-release
```

### **Manual Publishing Scripts:**
```bash
# Test publishing
pnpm run publish-native-test
pnpm run publish-web-test

# Alpha publishing
pnpm run publish-native-alpha
pnpm run publish-web-alpha

# Production publishing
pnpm run publish-native-public
pnpm run publish-web-public
```

---

## Quick Checklist

1. ✅ Start feature branch from `dev`
2. ✅ Use conventional commit messages
3. ✅ Create PR to `dev` for beta release
4. ✅ Test beta version
5. ✅ Create PR `dev` → `main` for production release
6. ✅ Pull changes and tags after release

---