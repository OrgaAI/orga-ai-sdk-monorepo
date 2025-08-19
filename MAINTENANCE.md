# Orga SDK Monorepo – Internal Maintenance Guide

This document is for the internal team. It covers best practices for versioning, publishing, and maintaining the Orga SDK monorepo.

---

## Table of Contents
- [Version Bumping](#version-bumping)
- [Committing and Tagging](#committing-and-tagging)
- [Pushing Changes](#pushing-changes)
- [Publishing Packages](#publishing-packages)
- [Common Pitfalls](#common-pitfalls)
- [Scripts Reference](#scripts-reference)

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

## Version Bumping

**Always commit your work before running any version bump script.**

1. **Commit all changes:**
   ```sh
   git add .
   git commit -m "<your message>"
   ```
2. **Run the appropriate bump script:**
   - For a test prerelease:
     ```sh
     pnpm run bump-native-test
     # or
     pnpm run bump-web-test
     ```
   - For an alpha prerelease:
     ```sh
     pnpm run bump-native-alpha
     # or
     pnpm run bump-web-alpha
     ```
   - For a release (patch):
     ```sh
     pnpm run bump-native-release
     # or
     pnpm run bump-web-release
     ```

This will update the version in the relevant `package.json`, create a commit, and create a git tag.

---

## Committing and Tagging

- The version bump script creates a commit and a tag automatically.
- **Do not have staged or unstaged changes when running the bump script.**
  - If you do, the script will fail (unstaged) or include staged changes in the version commit (not recommended).

---

## Pushing Changes

**After every version bump, always push with tags:**

```sh
git push --follow-tags
```
- This pushes both your branch and any new tags to the remote (GitHub).
- If you just run `git push`, the tag will NOT be pushed.
- If you want to be explicit about the branch:
  ```sh
  git push --follow-tags origin your-branch
  ```

---

## Publishing Packages

After pushing your changes and tags, publish the package as needed:

- For native test publish:
  ```sh
  pnpm run publish-native-test
  ```
- For web test publish:
  ```sh
  pnpm run publish-web-test
  ```

For testing SDK changes locally within one of the example applications (mobile or web) 

- cd into the SDK that has changes and run a build:
  ```sh
  cd packages/sdk-web 
  #or 
  cd packages/sdk-react-native
  ```
  ```sh
  bun run build
  ```
- Enter the application you wish to test in and install if any new packages then run the dev server:
  ```sh
  # mobile
  cd apps/mobile
  bunx expo install
  bunx expo -c
  ```
  ```sh
  # web
  cd apps/web
  bun install
  bun run dev
  ```
---

## Common Pitfalls

- **Uncommitted changes:** The version script will fail if you have unstaged changes.
- **Staged changes:** Any staged changes will be included in the version commit. Always commit first.
- **Forgetting to push tags:** If you forget `--follow-tags`, your tag will not be on GitHub. Run `git push --follow-tags` to fix.
- **Branch confusion:** If you’re on the correct branch, `git push --follow-tags` is enough. Otherwise, specify the branch.

---

## Scripts Reference
**test and alpha are published as private npm packages**

- `bump-native-test` – Bump native SDK to next test prerelease
- `bump-web-test` – Bump web SDK to next test prerelease
- `bump-native-alpha` – Bump native SDK to next alpha prerelease
- `bump-web-alpha` – Bump web SDK to next alpha prerelease
- `bump-native-release` – Bump native SDK patch version
- `bump-web-release` – Bump web SDK patch version
- `publish-native-test` – Build and publish native SDK with `test` tag 
- `publish-web-test` – Build and publish web SDK with `test` tag
- `publish-native-alpha` – Build and publish native SDK with `alpha` tag
- `publish-web-alpha` – Build and publish web SDK with `alpha` tag
- `publish-native-public` – Build and publish native SDK for public use
- `publish-web-public` – Build and publish web SDK for public use

---

## Quick Checklist

1. Commit all your changes
2. Run the version bump script
3. Push with `git push --follow-tags`
4. Run the publish script if needed

---