import Link from "next/link"
import { getConfig, SpecraConfig } from "@/lib/config"
import { Logo } from "./logo"

export function Footer({ config }: { config: SpecraConfig }) {
  // Server component - can use getConfig directly
  // const config = getConfig()

  // The watermark is ALWAYS shown by default per the license.
  // It can only be hidden with an active paid subscription (Starter+).
  // Setting showBranding: false without a paid tier is a license violation.
  const hideBranding = config.footer?.branding?.showBranding === false

  return (
    <footer className="bg-muted/30 dark:bg-muted/10 rounded-2xl mt-24">
      <div className="px-2 md:px-6 py-12">
        {config.footer?.links && config.footer.links.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {config.footer.links.map((column, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-foreground mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {config.footer?.copyright && (
              <p className="text-sm text-muted-foreground text-center md:text-left">
                {config.footer.copyright}
              </p>
            )}

            {!hideBranding && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {config.footer?.branding?.logo && (
                  <Logo
                    logo={config.footer.branding.logo}
                    alt={config.footer.branding.title || "Powered by"}
                    className="h-5 w-auto object-contain"
                  />
                )}
                <span>Powered by</span>
                <Link
                  href="https://specra-docs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-foreground transition-colors"
                >
                  Specra
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
