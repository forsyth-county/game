import posthog from 'posthog-js'

posthog.init('phc_UxFsQxTXGf827YwM7QGrkVyQUhbQ6tTdknX2cfdoCkv', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    defaults: '2026-10-10'
});
