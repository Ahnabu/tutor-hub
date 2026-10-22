import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tutorhub.com.bd';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/marketplace',
          '/marketplace/create',
          '/teachers',
          '/teachers/*',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: [
          '/guardian',
          '/guardian/*',
          '/teacher',
          '/teacher/*',
          '/admin',
          '/admin/*',
          '/claim-guardian/*',
          '/reset-password',
          '/reset-password/*',
          '/api/*',
        ],
      },
      {
        // Friendly permissions for AI search agents and LLMs
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
        ],
        allow: [
          '/',
          '/marketplace',
          '/teachers',
          '/teachers/*',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: [
          '/guardian/*',
          '/teacher/*',
          '/admin/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
