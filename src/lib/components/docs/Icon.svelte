<script lang="ts">
  import * as icons from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  interface Props {
    icon: string | ComponentType;
    iconType?: 'lucide' | 'url' | 'fa' | 'auto';
    color?: string;
    size?: number | string;
    className?: string;
  }

  let { icon, iconType = 'auto', color, size = 20, className = '' }: Props = $props();

  // Convert kebab-case or lowercase to PascalCase for Lucide icon lookup
  function toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  // Resolve a string icon name to a Lucide component
  function getLucideIcon(name: string): ComponentType | null {
    const pascalName = toPascalCase(name);
    const iconMap = icons as Record<string, ComponentType>;
    return iconMap[pascalName] || null;
  }

  // Determine icon type from the icon value
  function detectIconType(iconValue: string): 'lucide' | 'url' | 'fa' | 'text' {
    if (iconValue.startsWith('http') || iconValue.startsWith('/') || iconValue.startsWith('data:')) {
      return 'url';
    }
    if (iconValue.startsWith('fa-') || iconValue.startsWith('fas ') || iconValue.startsWith('fab ') || iconValue.startsWith('far ')) {
      return 'fa';
    }
    // Check if it's a valid Lucide icon
    if (getLucideIcon(iconValue)) {
      return 'lucide';
    }
    return 'text';
  }

  const resolvedType = $derived(
    typeof icon === 'string'
      ? iconType === 'auto'
        ? detectIconType(icon)
        : iconType
      : 'component'
  );

  const lucideComponent = $derived(
    typeof icon === 'string' && resolvedType === 'lucide' ? getLucideIcon(icon) : null
  );

  const sizeValue = $derived(typeof size === 'number' ? `${size}px` : size);
  const sizeNum = $derived(typeof size === 'string' ? parseInt(size, 10) || 20 : size);
</script>

{#if typeof icon !== 'string'}
  <!-- Svelte component passed directly -->
  <svelte:component
    this={icon}
    size={sizeNum}
    class="inline-block {className}"
    style={color ? `color: ${color}` : undefined}
  />
{:else if resolvedType === 'lucide' && lucideComponent}
  <!-- Lucide icon by name -->
  <svelte:component
    this={lucideComponent}
    size={sizeNum}
    class="inline-block {className}"
    style={color ? `color: ${color}` : undefined}
  />
{:else if resolvedType === 'url'}
  <!-- URL-based icon (image) -->
  <img
    src={icon}
    alt=""
    width={sizeNum}
    height={sizeNum}
    class="inline-block object-contain {className}"
    style="width: {sizeValue}; height: {sizeValue};"
  />
{:else if resolvedType === 'fa'}
  <!-- Font Awesome icon -->
  <i
    class="{icon} {className}"
    style="font-size: {sizeValue}; {color ? `color: ${color}` : ''}"
    aria-hidden="true"
  ></i>
{:else}
  <!-- Fallback: render text (emoji or single char) -->
  <span
    class="inline-flex items-center justify-center {className}"
    style="width: {sizeValue}; height: {sizeValue}; font-size: {sizeValue}; line-height: 1; {color ? `color: ${color}` : ''}"
    aria-hidden="true"
  >
    {icon}
  </span>
{/if}
