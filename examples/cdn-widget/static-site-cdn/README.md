# Orga AI Widget - Static Site Example

This example demonstrates how to embed the Orga AI widget in a static HTML page using the CDN approach. The widget is loaded via a script tag and initialized with JavaScript.

## What This Example Shows

- **CDN Integration**: Loading the widget from a CDN using `<script>` tags
- **Static HTML**: Embedding the widget in a plain HTML file
- **Backend API**: A Next.js API route that provides session configuration
- **CORS Configuration**: How to set up CORS headers for cross-origin requests

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of this example directory:

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
2. You should see the Orga AI widget embedded in the page
3. Click "Start session" to begin a conversation
4. Try enabling the microphone or camera to test media permissions

## How It Works

### Backend API Route

The example includes a Next.js API route at `app/api/route.ts` that:
- Uses the `@orga-ai/node` SDK to get session configuration
- Returns an ephemeral token and ICE servers
- Handles errors gracefully

### Frontend Widget Initialization

The widget is initialized in `public/index.html`:

```html
<script src="https://orga-widget-next.vercel.app/init.global.js"></script>
<script>
  OrgaWidget.initWidget({
    fetchSessionConfig: () =>
      fetch("http://localhost:3000/api").then((res) => res.json()),
  });
</script>
<div data-orga-widget></div>
```

### CORS Configuration

The `next.config.ts` file includes CORS headers to allow requests from external origins (like when testing with Live Server). If you're serving the HTML from a different origin, update the `Access-Control-Allow-Origin` header accordingly.

## Testing with Live Server

If you want to test the static HTML file with a tool like Live Server (VS Code extension) or any other static file server:

1. **Update the API endpoint** in `public/index.html` to point to your Next.js backend:
   ```html
   fetchSessionConfig: () =>
     fetch("http://localhost:3000/api").then((res) => res.json()),
   ```

2. **Ensure CORS is configured** in `next.config.ts` to allow requests from your Live Server origin (default is `http://127.0.0.1:5500`)

3. **Start both servers**:
   - Next.js backend: `pnpm run dev` (port 3000)
   - Live Server: Open `public/index.html` with Live Server (usually port 5500)

4. The widget should work across origins thanks to the CORS configuration

## Troubleshooting

### Camera/Microphone Permission Denied

If you see "Permission denied" errors:

1. **Check browser site settings**:
   - Click the lock icon in your browser's address bar
   - Go to Site settings
   - Ensure Camera and Microphone are set to "Ask" (not "Block" or "Deny")

2. **Check system permissions** (macOS):
   - System Settings → Privacy & Security → Camera
   - System Settings → Privacy & Security → Microphone
   - Ensure your browser has permission

3. **Use a fresh incognito/private window** to test with default permissions

### CORS Errors

If you see CORS errors in the console:

1. Verify the `Access-Control-Allow-Origin` header in `next.config.ts` matches your frontend origin
2. Ensure the backend server is running
3. Check that the API endpoint is accessible

### Widget Not Loading

1. Check the browser console for errors
2. Verify the CDN script URL is accessible
3. Ensure the `data-orga-widget` element exists in the DOM
4. Verify the API endpoint returns valid session configuration

## Next Steps

- Customize the widget appearance using the `branding` options
- Try different themes: `floating-badge`, `panel`, or `full`
- Configure video preview and transcript visibility
- Check out the [next-widget example](../next-widget/README) for widget SDK integration
