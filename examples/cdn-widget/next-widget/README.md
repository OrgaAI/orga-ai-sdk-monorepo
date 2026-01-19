# Orga AI Widget - Next.js Example

This example demonstrates how to integrate the Orga AI widget into a Next.js App Router application using the npm package (`@orga-ai/widget`).

## What This Example Shows

- **NPM Package Integration**: Using `@orga-ai/widget` as a dependency
- **React Component**: Initializing the widget in a React component
- **Next.js App Router**: Integration with Next.js 16+ App Router
- **Permissions-Policy Headers**: Required headers for camera/microphone access
- **TypeScript Support**: Full TypeScript support with type definitions

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root of this example directory:

```bash
ORGA_API_KEY=sk_orga_ai_your_api_key_here
```

Get your API key from [platform.orga-ai.com](https://platform.orga-ai.com).

### 3. Start the Development Server

```bash
pnpm run dev
```

The server will start on `http://localhost:3000` by default.

### 4. Test the Widget

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the Orga AI widget (floating badge or panel depending on configuration)
3. Click the widget to open it
4. Click "Start session" to begin a conversation
5. Try enabling the microphone or camera to test media permissions

## How It Works

### Widget Component

The widget is initialized in `components/OrgaWidgetClient.tsx`:

```tsx
"use client";
import { initWidget } from "@orga-ai/widget";
import { useEffect } from "react";

export const OrgaWidgetClient = () => {
  useEffect(() => {
    initWidget({
      fetchSessionConfig: () => fetch("/api").then((res) => res.json()),
      theme: "floating-badge",
      branding: {
        brandName: "My app",
        tagline: "Your app's assistant",
        // ... more branding options
      },
    });
  }, []);

  return <div data-orga-widget />;
};
```

### Layout Integration

The widget component is added to `app/layout.tsx` so it's available on all pages:

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <OrgaWidgetClient />
      </body>
    </html>
  );
}
```

### Backend API Route

The API route at `app/api/route.ts` provides session configuration:

```tsx
import { OrgaAI } from "@orga-ai/node";

const orga = new OrgaAI({
  apiKey: process.env.ORGA_API_KEY!,
});

export async function GET() {
  const sessionConfig = await orga.getSessionConfig();
  return NextResponse.json(sessionConfig);
}
```

## Troubleshooting

### Camera/Microphone Permission Denied

If you see "Permission denied" errors when trying to enable camera/microphone:

1. **Check browser site settings** (most common issue):
   - Click the lock icon in your browser's address bar
   - Go to Site settings
   - Ensure Camera and Microphone are set to "Ask" (not "Block" or "Deny")
   - If they're set to "Deny", change them to "Ask" and refresh the page

2. **Verify Permissions-Policy header is present**:
   - Open DevTools → Network tab
   - Reload the page
   - Click the main document request
   - Check Response Headers for `Permissions-Policy: camera=*, microphone=*`

3. **Check system permissions** (macOS):
   - System Settings → Privacy & Security → Camera
   - System Settings → Privacy & Security → Microphone
   - Ensure your browser has permission

4. **Use a fresh incognito/private window** to test with default permissions

### Widget Not Appearing

1. Check the browser console for errors
2. Verify the `data-orga-widget` element exists in the DOM
3. Ensure the API route at `/api` is accessible and returns valid data
4. Check that `OrgaWidgetClient` is rendered in your layout

### API Route Errors

1. Verify `ORGA_API_KEY` is set in `.env.local`
2. Check the server console for error messages
3. Ensure the API key is valid and has the correct permissions
4. Test the API route directly: `http://localhost:3000/api`

### Next.js 16 Proxy Configuration

If you're using Next.js 16+, the `proxy.ts` file is required for setting headers. If you don't see the Permissions-Policy header:

1. Ensure `proxy.ts` exists in the root of the example directory
2. Restart the dev server completely (stop and start again)
3. Check the server console for `[Proxy]` log messages

## Customization

### Widget Themes

Try different themes in `OrgaWidgetClient.tsx`:

```tsx
theme: "floating-badge", // Floating badge that expands
theme: "panel",          // Side panel
theme: "full",           // Full-screen overlay
```

### Branding Options

Customize the widget appearance:

```tsx
branding: {
  brandName: "My App",
  tagline: "Your assistant",
  accentColor: "#6366f1",
  backgroundColor: "#171717",
  textColor: "#ffffff",
  logoUrl: "/logo.png",
  // ... more options
}
```

### Feature Configuration

Control widget features:

```tsx
transcript: "panel",      // Show transcript panel
transcript: "hidden",      // Hide transcript
videoPreview: "optional",  // Allow camera toggle
videoPreview: "required", // Require camera
videoPreview: "hidden",   // Hide camera preview
```

## Next Steps

- Customize the widget appearance using the `branding` options
- Try different themes: `floating-badge`, `panel`, or `full`
- Configure video preview and transcript visibility
- Check out the [static-site example](../static-site-cdn/README) for CDN integration
