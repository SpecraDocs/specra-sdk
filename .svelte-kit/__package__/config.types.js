/**
 * Configuration schema for Specra documentation system
 */
/**
 * Default configuration values
 */
export const defaultConfig = {
    site: {
        title: "Documentation",
        description: "Project documentation",
        baseUrl: "/",
        language: "en",
    },
    theme: {
        defaultMode: "system",
        respectPrefersColorScheme: true,
    },
    navigation: {
        showSidebar: true,
        collapsibleSidebar: true,
        showBreadcrumbs: true,
        showTableOfContents: true,
        tocPosition: "right",
        tocMaxDepth: 3,
    },
    search: {
        enabled: true,
        provider: "local",
        placeholder: "Search documentation...",
    },
    features: {
        showLastUpdated: true,
        showReadingTime: true,
        showAuthors: false,
        showTags: true,
        versioning: true,
        i18n: false,
    },
};
