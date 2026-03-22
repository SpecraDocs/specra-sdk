import { getAllDocs, getVersions } from "./mdx"
import { getProducts } from "./config.server"

export interface RedirectMapping {
  from: string
  to: string
}

/**
 * Build redirect mappings from all docs' redirect_from frontmatter.
 * In multi-product mode, generates product-aware redirect URLs.
 */
export async function buildRedirectMappings(): Promise<RedirectMapping[]> {
  const redirects: RedirectMapping[] = []
  const products = getProducts()

  if (products.length === 0) {
    // Single-product mode — current behavior
    const versions = getVersions()
    for (const version of versions) {
      const docs = await getAllDocs(version)
      for (const doc of docs) {
        if (doc.meta.redirect_from && Array.isArray(doc.meta.redirect_from)) {
          for (const oldPath of doc.meta.redirect_from) {
            redirects.push({
              from: oldPath,
              to: `/docs/${version}/${doc.slug}`,
            })
          }
        }
      }
    }
  } else {
    // Multi-product mode
    for (const product of products) {
      const versions = getVersions(product.isDefault ? undefined : product.slug)
      const urlPrefix = product.isDefault ? "/docs" : `/docs/${product.slug}`

      for (const version of versions) {
        const docs = await getAllDocs(version, undefined, product.isDefault ? undefined : product.slug)
        for (const doc of docs) {
          if (doc.meta.redirect_from && Array.isArray(doc.meta.redirect_from)) {
            for (const oldPath of doc.meta.redirect_from) {
              redirects.push({
                from: oldPath,
                to: `${urlPrefix}/${version}/${doc.slug}`,
              })
            }
          }
        }
      }
    }
  }

  return redirects
}

/**
 * Find redirect destination for a given path
 */
export async function findRedirect(path: string): Promise<string | null> {
  const redirects = await buildRedirectMappings()
  const redirect = redirects.find((r) => r.from === path)
  return redirect ? redirect.to : null
}
