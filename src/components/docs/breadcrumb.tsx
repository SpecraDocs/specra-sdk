import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { getConfig } from "@/lib/config"

interface BreadcrumbProps {
  version: string
  slug: string
  title: string
}

export function Breadcrumb({ version, slug, title }: BreadcrumbProps) {
  const config = getConfig()
  const i18n = config.features?.i18n
  const locales = typeof i18n === 'object' ? i18n.locales : (i18n ? ['en'] : [])
  const defaultLocale = typeof i18n === 'object' ? i18n.defaultLocale : 'en'

  const parts = slug.split("/")

  // Check if first part is a locale
  const potentialLocale = parts[0]
  const isLc = locales.includes(potentialLocale)
  const isDefaultLc = potentialLocale === defaultLocale

  // If slug starts with locale, we might want to skip showing it as a breadcrumb item
  // But we want the "Docs" home link to point to it (if it's not default provided we prefix default?)

  const homeHref = isLc
    ? `/docs/${version}/${potentialLocale}`
    : `/docs/${version}`

  const breadcrumbs = [
    { label: "Docs", href: homeHref },
  ]

  // Build breadcrumb path
  let currentPath = ""
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    currentPath += (currentPath ? "/" : "") + part

    // Skip the locale part in the breadcrumb visual trail if it's the first part
    if (i === 0 && isLc) {
      continue
    }

    breadcrumbs.push({
      label: part.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      href: `/docs/${version}/${currentPath}`,
    })
  }

  // Add current page
  breadcrumbs.push({
    label: title,
    href: `/docs/${version}/${slug}`,
  })

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
