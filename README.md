# Specra

A modern documentation library for SvelteKit that makes it easy to create beautiful, feature-rich documentation sites.
To view the docs, visit [Specra Docs](https://specra-docs.com).

## Features

- **MDX Support** - Write documentation in Markdown with Svelte components
- **Multi-Version Docs** - Support multiple documentation versions seamlessly
- **API Reference Generation** - Auto-generate API docs from OpenAPI, Postman, or Specra formats
- **Full-Text Search** - Integrated MeiliSearch support for fast search
- **Tab Groups** - Organize content into multiple navigation tabs
- **Dark Mode** - Built-in theme switching with system preference detection
- **Customizable** - Highly configurable with Tailwind CSS
- **Fast** - Built on SvelteKit with optimized performance
- **Responsive** - Mobile-friendly design out of the box
- **Hot Reload** - Instant updates during development

## Installation

```bash
npm install specra
# or
yarn add specra
# or
pnpm add specra
```

## Quick Start

### 1. Create a new SvelteKit app (if you don't have one)

```bash
npx create-specra my-docs
cd my-docs
```

Or manually with SvelteKit:

```bash
npx sv create my-docs
cd my-docs
npm install specra
```

### 2. Set up your project structure

```
my-docs/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout with Specra components
│   │   ├── +layout.ts           # Load config
│   │   ├── +page.svelte         # Your landing page
│   │   └── docs/
│   │       └── [version]/
│   │           └── [...slug]/
│   │               ├── +page.svelte   # Doc page
│   │               └── +page.ts       # Load doc data
│   └── app.html
├── docs/                         # Your MDX content
│   └── v1.0.0/
│       └── getting-started.mdx
├── static/
│   └── logo.png
├── specra.config.json            # Specra configuration
├── svelte.config.js
└── vite.config.ts
```

### 3. Configure specra.config.json

```json
{
  "site": {
    "title": "My Documentation",
    "description": "Awesome docs built with Specra",
    "url": "https://docs.example.com",
    "activeVersion": "v1.0.0"
  },
  "theme": {
    "defaultMode": "system",
    "respectPrefersColorScheme": true
  },
  "navigation": {
    "showSidebar": true,
    "collapsibleSidebar": true,
    "showBreadcrumbs": true,
    "showTableOfContents": true,
    "sidebarStyle": "card"
  },
  "features": {
    "versioning": true,
    "showVersionBadge": false,
    "showReadingTime": true
  }
}
```

### 4. Create your first doc

```mdx
---
title: Getting Started
description: Learn how to get started with our platform
---

# Getting Started

Welcome to the documentation!
```

### 5. Import globals.css

Add to your root stylesheet:

```css
@import 'specra/styles';

/* Your custom styles */
```

### 6. Run development server

```bash
npm run dev
```

Visit `http://localhost:5173/docs/v1.0.0/getting-started` to see your docs!

## Configuration

See [Configuration Guide](https://specra-docs.com/docs) for full documentation.

## Upgrading

Simply update the package to get latest features and bug fixes:

```bash
npm update specra
```

Your content and configuration stay the same - only the SDK updates!

## Specra SaaS

The official documentation site ([specra-docs](https://specra-docs.com)) also serves as a SaaS platform with paid tiers (Starter, Pro, Enterprise). It includes:
- Authentication (Auth.js with GitHub OAuth + email/password)
- Subscription billing via Stripe (USD) and M-Pesa Daraja (KES)
- User dashboard with plan management and billing history
- PostgreSQL database via Prisma v7

The SaaS layer is implemented entirely within specra-docs and does not affect the SDK itself. Users of the SDK can build free, self-hosted documentation sites without any billing features.

## Why Specra?

Specra is designed to be the easiest way to create documentation for your projects. It handles all the complex parts (versioning, search, API references) while letting you focus on writing great content.

## License

MIT with Branding Requirement — see [LICENSE.MD](LICENSE.MD).

All documentation sites built with Specra must display the "Powered by Specra" watermark. Removing the watermark requires an active paid subscription (Starter tier or above) at [specra-docs.com](https://specra-docs.com). Unauthorized removal of the watermark is a copyright violation.

## Authors

dalmasonto, arthur-kamau
