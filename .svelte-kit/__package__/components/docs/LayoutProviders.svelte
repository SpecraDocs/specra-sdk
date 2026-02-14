<script lang="ts">
  /**
   * Root layout provider that initializes all Specra stores.
   * Use this in your root +layout.svelte to set up config, theme, and tab state.
   *
   * In Svelte, this replaces:
   * - React ConfigProvider
   * - React TabProvider + TabSync
   * - React SidebarStateProvider
   * - React ThemeProvider (next-themes)
   *
   * Usage:
   * ```svelte
   * <LayoutProviders config={data.config}>
   *   <slot />
   * </LayoutProviders>
   * ```
   */
  import { onMount } from 'svelte'
  import { setConfigContext } from '../../stores/config'
  import { tabStore } from '../../stores/tabs'
  import { themeStore } from '../../stores/theme'
  import type { SpecraConfig } from '../../config.types'

  let {
    config,
    currentPageTabGroup,
    children
  }: {
    config: SpecraConfig
    currentPageTabGroup?: string
    children?: import('svelte').Snippet
  } = $props()

  // Set config in context for child components
  const configCtx = setConfigContext(config)

  // Update config context when prop changes
  $effect(() => {
    configCtx.set(config)
  })

  // Initialize tab store
  $effect(() => {
    const defaultTab = config.navigation?.tabGroups?.[0]?.id || ''
    tabStore.initialize(defaultTab)
  })

  // Sync tab state when page tab group changes
  $effect(() => {
    if (currentPageTabGroup) {
      tabStore.set(currentPageTabGroup)
    }
  })
</script>

{@render children?.()}
