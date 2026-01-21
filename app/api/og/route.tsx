import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Dynamic parameters
    const title = searchParams.get('title') || 'Make Your Codebase AI-Ready'
    const subtitle = searchParams.get('subtitle') || 'Free tools to optimize for AI collaboration'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            position: 'relative',
          }}
        >
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
              opacity: 0.5,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              zIndex: 1,
            }}
          >
            {/* Logo text */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                background: 'linear-gradient(90deg, #3B82F6, #06B6D4, #9333EA)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 40,
                letterSpacing: '-0.05em',
              }}
            >
              aiready
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                marginBottom: 24,
                maxWidth: '900px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 32,
                color: '#94a3b8',
                textAlign: 'center',
                maxWidth: '800px',
                lineHeight: 1.4,
                marginBottom: 48,
              }}
            >
              {subtitle}
            </div>

            {/* Features */}
            <div
              style={{
                display: 'flex',
                gap: 40,
                fontSize: 24,
                color: '#06B6D4',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>✓</span> Free Forever
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>✓</span> Open Source
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>✓</span> Runs Locally
              </div>
            </div>

            {/* Command */}
            <div
              style={{
                marginTop: 48,
                padding: '20px 40px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 12,
                border: '2px solid rgba(59, 130, 246, 0.3)',
                fontSize: 28,
                color: '#06B6D4',
                fontFamily: 'monospace',
              }}
            >
              npx @aiready/cli scan .
            </div>
          </div>

          {/* Bottom badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              fontSize: 20,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            getaiready.dev
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}
