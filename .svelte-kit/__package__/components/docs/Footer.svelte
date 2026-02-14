<script lang="ts">
  import type { SpecraConfig } from '../../config.types.js';
  import Logo from './Logo.svelte';

  interface Props {
    config: SpecraConfig;
  }

  let { config }: Props = $props();

  // The watermark is ALWAYS shown by default per the license.
  // It can only be hidden with an active paid subscription (Starter+).
  // Setting showBranding: false without a paid tier is a license violation.
  let hideBranding = $derived(config.footer?.branding?.showBranding === false);
</script>

<footer class="bg-muted/30 dark:bg-muted/10 rounded-2xl mt-24">
  <div class="px-2 md:px-6 py-12">
    {#if config.footer?.links && config.footer.links.length > 0}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {#each config.footer.links as column, idx (idx)}
          <div>
            <h3 class="font-semibold text-foreground mb-4">{column.title}</h3>
            <ul class="space-y-2">
              {#each column.items as item, itemIdx (itemIdx)}
                <li>
                  <a
                    href={item.href}
                    class="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    {/if}

    <div class="pt-8 border-t border-border/50">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        {#if config.footer?.copyright}
          <p class="text-sm text-muted-foreground text-center md:text-left">
            {config.footer.copyright}
          </p>
        {/if}

        {#if !hideBranding}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            {#if config.footer?.branding?.logo}
              <Logo
                logo={config.footer.branding.logo}
                alt={config.footer.branding.title || 'Powered by'}
                className="h-5 w-auto object-contain"
              />
            {/if}
            <span>Powered by</span>
            <a
              href="https://specra-docs.com"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold hover:text-foreground transition-colors"
            >
              Specra
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</footer>
