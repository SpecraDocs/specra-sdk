<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Icon from './Icon.svelte';

  /** Flat shape (from page components) */
  interface ProductItemFlat {
    slug: string;
    label: string;
    icon?: string;
    badge?: string;
    activeVersion?: string;
    isDefault: boolean;
  }

  /** Nested shape (from SDK getProducts()) */
  interface ProductItemNested {
    slug: string;
    config: {
      label: string;
      icon?: string;
      badge?: string;
      activeVersion?: string;
    };
    isDefault: boolean;
  }

  type ProductInput = ProductItemFlat | ProductItemNested;

  interface Props {
    products: ProductInput[];
    currentProduct?: string;
  }

  let { products, currentProduct }: Props = $props();

  /** Normalize either shape to flat */
  function normalize(p: ProductInput): ProductItemFlat {
    if ('config' in p && p.config) {
      return {
        slug: p.slug,
        label: p.config.label,
        icon: p.config.icon,
        badge: p.config.badge,
        activeVersion: p.config.activeVersion,
        isDefault: p.isDefault,
      };
    }
    return p as ProductItemFlat;
  }

  let normalizedProducts = $derived(products.map(normalize));

  let isOpen = $state(false);
  let dropdownEl = $state<HTMLDivElement | null>(null);

  let currentLabel = $derived.by(() => {
    const product = normalizedProducts.find(p =>
      currentProduct ? p.slug === currentProduct : p.isDefault
    );
    return product?.label || 'Docs';
  });

  let currentIcon = $derived.by(() => {
    const product = normalizedProducts.find(p =>
      currentProduct ? p.slug === currentProduct : p.isDefault
    );
    return product?.icon;
  });

  $effect(() => {
    if (!browser || !isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
        isOpen = false;
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        isOpen = false;
      }
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  function switchProduct(product: ProductItemFlat) {
    const isCurrentProduct = currentProduct
      ? product.slug === currentProduct
      : product.isDefault;

    if (isCurrentProduct) {
      isOpen = false;
      return;
    }

    isOpen = false;

    const version = product.activeVersion || 'v1.0.0';
    if (product.isDefault) {
      goto(`/docs/${version}`);
    } else {
      goto(`/docs/${product.slug}/${version}`);
    }
  }

  function isCurrentProductItem(product: ProductItemFlat): boolean {
    return currentProduct
      ? product.slug === currentProduct
      : product.isDefault;
  }
</script>

{#if products.length > 1}
  <div class="relative" bind:this={dropdownEl}>
    <button
      onclick={() => (isOpen = !isOpen)}
      class="flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors text-foreground"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label="Switch product"
    >
      {#if currentIcon}
        <Icon icon={currentIcon} size={14} />
      {/if}
      <span>{currentLabel}</span>
      <ChevronDown class="h-3.5 w-3.5 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}" />
    </button>

    {#if isOpen}
      <div
        class="absolute top-full left-0 mt-1 w-56 py-1 bg-popover border border-border rounded-md shadow-lg z-50"
        role="listbox"
        aria-label="Available products"
      >
        {#each normalizedProducts as product}
          <button
            role="option"
            aria-selected={isCurrentProductItem(product)}
            onclick={() => switchProduct(product)}
            class="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors {isCurrentProductItem(product)
              ? 'text-primary bg-accent/50 font-medium'
              : 'text-foreground hover:bg-accent'}"
          >
            <span class="flex items-center gap-2">
              {#if product.icon}
                <Icon icon={product.icon} size={14} />
              {/if}
              <span class="flex flex-col items-start">
                <span class="flex items-center gap-1.5">
                  {product.label}
                  {#if product.badge}
                    <span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary leading-none">{product.badge}</span>
                  {/if}
                </span>
              </span>
            </span>
            {#if isCurrentProductItem(product)}
              <Check class="h-3.5 w-3.5 text-primary" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
