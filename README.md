# WalkmanJS Widget

Embeddable onboarding tour widget for WalkmanJS.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Usage

Add this script to your website:

```html
<script 
  src="https://widget.walkmanjs.com/tour.js" 
  data-tour-id="YOUR_TOUR_ID" 
  data-api-key="YOUR_API_KEY"
></script>
```

## API

The widget exposes a global `WalkmanJS` object:

```javascript
// Start the tour manually (for click trigger)
WalkmanJS.start();

// Stop the tour
WalkmanJS.stop();

// Navigate
WalkmanJS.next();
WalkmanJS.prev();
```

## Configuration

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-tour-id` | Yes | The tour ID from WalkmanJS dashboard |
| `data-api-key` | Yes | Your API key |

The Convex URL is baked into the build — no need to expose it in the script tag.

## Building for Production

1. Create `.env` file with your Convex URL:
   ```
   CONVEX_URL=https://your-deployment.convex.cloud
   ```

2. Build:
   ```bash
   pnpm build
   ```

## Build Output

After running `pnpm build`, the output will be in `dist/tour.iife.js`.

