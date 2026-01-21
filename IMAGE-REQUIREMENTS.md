# Image Requirements for SEO

## Required Images

### 1. Open Graph Image (`/public/og-image.png`)
**Dimensions**: 1200x630px  
**Format**: PNG or JPG  
**Purpose**: Social media sharing preview

**Content Suggestions**:
- AIReady logo
- Tagline: "Make Your Codebase AI-Ready"
- Key benefits: "Free • Open Source • Local"
- Visual: Code snippet or AI-themed graphics
- Brand colors: Blue (#3B82F6) to Cyan (#06B6D4) gradient

**Design Tips**:
- Keep text large and readable
- High contrast
- Mobile preview-friendly
- Test on different platforms (Twitter, LinkedIn, Facebook)

### 2. Screenshot (`/public/screenshot.png`)
**Dimensions**: Variable (recommend 1920x1080px)  
**Format**: PNG  
**Purpose**: Software application schema, documentation

**Content Suggestions**:
- Terminal showing CLI output
- Analysis results example
- Dashboard/report view
- Or composite showing all three tools

### 3. Favicon Set (Already Exists)
Using `/public/logo-transparent-bg.png`:
- ✅ 32x32px
- ✅ 16x16px
- ✅ 180x180px (Apple Touch Icon)

## Quick Creation Guide

### Using Figma (Recommended)
1. Create 1200x630px frame for OG image
2. Add brand elements (logo, colors, text)
3. Export as PNG at 2x resolution
4. Optimize with TinyPNG or ImageOptim

### Using Canva
1. Use "Social Media" template
2. Customize dimensions to 1200x630px
3. Add text and graphics
4. Download as PNG

### Using Code (HTML to Image)
```bash
# Install puppeteer
npm install puppeteer

# Create og-image-generator.js and run
node og-image-generator.js
```

### Using Screenshot Tools
For `/public/screenshot.png`:
1. Run CLI command: `npx @aiready/cli scan . --format json`
2. Take screenshot of terminal output
3. Or screenshot a formatted report
4. Crop and optimize

## Color Palette

Based on your existing design:
- Primary Blue: `#3B82F6`
- Cyan: `#06B6D4`
- Purple: `#9333EA`
- Slate: `#1E293B` (dark)
- White: `#FFFFFF`

## Text Content for OG Image

**Headline**: "Make Your Codebase AI-Ready"

**Subheadline Options**:
- "Free tools to optimize for AI collaboration"
- "Find what confuses AI models in 5 minutes"
- "Detect • Analyze • Optimize"

**Call-to-Action**:
- "npx @aiready/cli scan ."
- "getaiready.dev"

## Optimization Checklist

After creating images:
- [ ] Optimize file size (aim for <300KB for OG image)
- [ ] Use lossless compression
- [ ] Test on multiple social platforms
- [ ] Verify image loads correctly
- [ ] Check alt text is descriptive
- [ ] Test with different link preview tools

## Testing Tools

1. **Twitter Card Validator**
   https://cards-dev.twitter.com/validator

2. **Facebook Sharing Debugger**
   https://developers.facebook.com/tools/debug/

3. **LinkedIn Post Inspector**
   https://www.linkedin.com/post-inspector/

4. **Meta Tags Tester**
   https://metatags.io/

## Alternative: Use Vercel OG Image Generation

If you don't want to create static images, use Vercel's OG Image generation:

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #3B82F6, #06B6D4)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 60,
          fontWeight: 'bold',
        }}
      >
        <div>Make Your Codebase</div>
        <div>AI-Ready</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

Then update metadata:
```typescript
openGraph: {
  images: ['/api/og'],
}
```
