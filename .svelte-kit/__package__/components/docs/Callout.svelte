<script lang="ts">
  import {
    Info,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Lightbulb,
  } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  type CalloutType = 'info' | 'warning' | 'success' | 'error' | 'tip' | 'note' | 'danger';

  interface Props {
    type?: CalloutType;
    title?: string;
    children?: Snippet;
  }

  let { type = 'info', title, children }: Props = $props();

  const configs: Record<CalloutType, {
    icon: typeof Info;
    className: string;
    iconClassName: string;
    titleClassName: string;
    defaultTitle: string;
  }> = {
    info: {
      icon: Info,
      className: 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:bg-blue-400/5 dark:border-blue-500/20 dark:text-blue-400',
      iconClassName: 'text-blue-600 dark:text-blue-400',
      titleClassName: 'text-blue-700 dark:text-blue-300',
      defaultTitle: 'Info',
    },
    note: {
      icon: Info,
      className: 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:bg-blue-400/5 dark:border-blue-500/20 dark:text-blue-400',
      iconClassName: 'text-blue-600 dark:text-blue-400',
      titleClassName: 'text-blue-700 dark:text-blue-300',
      defaultTitle: 'Note',
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-900 dark:bg-yellow-400/5 dark:border-yellow-500/20 dark:text-yellow-400',
      iconClassName: 'text-yellow-600 dark:text-yellow-400',
      titleClassName: 'text-yellow-700 dark:text-yellow-300',
      defaultTitle: 'Warning',
    },
    success: {
      icon: CheckCircle2,
      className: 'bg-green-500/10 border-green-500/30 text-green-900 dark:bg-green-400/5 dark:border-green-500/20 dark:text-green-400',
      iconClassName: 'text-green-600 dark:text-green-400',
      titleClassName: 'text-green-700 dark:text-green-300',
      defaultTitle: 'Success',
    },
    error: {
      icon: XCircle,
      className: 'bg-red-500/10 border-red-500/30 text-red-900 dark:bg-red-400/5 dark:border-red-500/20 dark:text-red-400',
      iconClassName: 'text-red-600 dark:text-red-400',
      titleClassName: 'text-red-700 dark:text-red-300',
      defaultTitle: 'Error',
    },
    danger: {
      icon: XCircle,
      className: 'bg-red-500/10 border-red-500/30 text-red-900 dark:bg-red-400/5 dark:border-red-500/20 dark:text-red-400',
      iconClassName: 'text-red-600 dark:text-red-400',
      titleClassName: 'text-red-700 dark:text-red-300',
      defaultTitle: 'Danger',
    },
    tip: {
      icon: Lightbulb,
      className: 'bg-purple-500/10 border-purple-500/30 text-purple-900 dark:bg-purple-400/5 dark:border-purple-500/20 dark:text-purple-400',
      iconClassName: 'text-purple-600 dark:text-purple-400',
      titleClassName: 'text-purple-700 dark:text-purple-300',
      defaultTitle: 'Tip',
    },
  };

  let config = $derived(configs[type] || configs.info);
  let displayTitle = $derived(title || config.defaultTitle);
  let IconComponent = $derived(config.icon);
</script>

<div class="flex gap-3 p-4 rounded-xl border my-2 {config.className}">
  <div class="flex-shrink-0 mt-0.5">
    <IconComponent class="h-5 w-5 {config.iconClassName}" />
  </div>
  <div class="flex-1 space-y-0">
    <div class="font-semibold text-sm {config.titleClassName}">{displayTitle}</div>
    <div class="text-sm leading-relaxed [&>p]:mb-0 [&>p]:text-current">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</div>
