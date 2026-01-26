# @orga-ai/create-orga-next-app

The easiest way to get started with [Orga AI](https://orga.ai) in Next.js. This CLI tool bootstraps a Next.js project with Orga AI SDKs, ShadCN UI components, and pre-configured setup files.

## Quick Start

```bash
npx @orga-ai/create-orga-next-app my-app
cd my-app
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## What's Included

Your new Next.js project comes pre-configured with:

- **Orga AI SDKs**
  - `@orga-ai/react` - React SDK for client-side integration
  - `@orga-ai/node` - Node.js SDK for server-side integration

- **ShadCN UI Components**
  - Button, Label, Select, Slider, Textarea components
  - Pre-configured with Tailwind CSS

- **Pre-configured Files**
  - `app/page.tsx` - Interactive playground showcasing Orga AI features
  - `app/layout.tsx` - Root layout with OrgaProvider setup
  - `app/providers/OrgaProvider.tsx` - Orga AI React provider component
  - `app/api/route.ts` - API route handler for Orga AI requests
  - `.env.local` - Environment variables template

- **Additional Dependencies**
  - `lucide-react` - Icon library

## Prerequisites

- **Node.js** 18.x or higher
- **npm** (comes with Node.js)

## Usage

### Basic Usage

```bash
npx @orga-ai/create-orga-next-app [project-name]
```

### Options

- `--skip-build` - Skip building the project after setup (faster, but you'll need to build manually)
- `--dry-run` - Show what would be done without actually creating the project

### Examples

```bash
# Create a new project
npx @orga-ai/create-orga-next-app my-orga-app

# Create with skip-build option
npx @orga-ai/create-orga-next-app my-orga-app --skip-build

# See what would happen (dry run)
npx @orga-ai/create-orga-next-app my-orga-app --dry-run
```

## Next Steps

After creating your project:

1. **Navigate to your project directory:**
   ```bash
   cd my-orga-app
   ```

2. **Add your Orga AI credentials:**
   - Open `.env.local` in your project root
   - Add your `ORGAAI_API_KEY` and `ORGAAI_USER_EMAIL`

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Explore the interactive playground page

## Project Structure

Your generated project will have the following structure:

```
my-orga-app/
├── app/
│   ├── page.tsx              # Orga AI Playground page
│   ├── layout.tsx            # Root layout with OrgaProvider
│   ├── providers/
│   │   └── OrgaProvider.tsx # Orga AI React provider
│   └── api/
│       └── route.ts          # API route handler
├── .env.local                # Environment variables (add your credentials here)
└── ...                       # Standard Next.js files
```

## Troubleshooting

### Node.js version is not supported

Ensure you have Node.js 18.x or higher installed:

```bash
node --version
```

If you need to update Node.js, visit [nodejs.org](https://nodejs.org/).

### Directory already exists

The project directory must not exist or must be empty. Choose a different project name or remove/empty the existing directory.

### Failed to create Next.js project

- Check your internet connection (create-next-app downloads templates)
- Ensure you have write permissions in the current directory

### Failed to install packages

- Check your internet connection
- Verify npm registry is accessible
- Try clearing npm cache: `npm cache clean --force`

### Build fails after project creation

This is non-critical. The project is still usable. You can build it manually later:

```bash
cd my-orga-app
npm run build
```

### ShadCN components installation issues

ShadCN requires Tailwind CSS, which should be automatically configured by create-next-app. If you encounter issues:

1. Ensure the Next.js project was created successfully
2. Check that `tailwind.config.ts` exists in your project
3. Verify `postcss.config.js` is present

## Learn More

- [Orga AI Documentation](https://docs.orga-ai.com)
- [Next.js Documentation](https://nextjs.org/docs)

## License

ISC
