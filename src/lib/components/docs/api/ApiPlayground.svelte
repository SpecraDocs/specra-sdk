<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import CodeBlock from '../CodeBlock.svelte';
  import { Play, Loader2 } from 'lucide-svelte';

  export interface PathParam {
    name: string;
    type: string;
    example?: any;
  }

  interface Props {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    defaultBody?: string;
    pathParams?: PathParam[];
  }

  let {
    method,
    path,
    baseUrl = '',
    headers = {},
    defaultBody,
    pathParams = [],
  }: Props = $props();

  let loading = $state(false);
  let response = $state<any>(null);
  let error = $state<string | null>(null);
  let requestBody = $state(defaultBody || '');

  // Initialize headers with empty strings if not provided
  let initialHeaders = $derived(() => {
    const cleanHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      cleanHeaders[key] = value || '';
    });
    return cleanHeaders;
  });

  let requestHeaders = $state(JSON.stringify(
    (() => {
      const cleanHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        cleanHeaders[key] = value || '';
      });
      return cleanHeaders;
    })(),
    null,
    2
  ));

  // Extract path parameters and initialize with defaults
  let extractedParams = $derived(() => {
    const params: Record<string, string> = {};
    const pathParamPattern = /:(\w+)/g;
    let match;

    while ((match = pathParamPattern.exec(path)) !== null) {
      const paramName = match[1];
      const paramConfig = pathParams.find((p) => p.name === paramName);

      // Set default value based on example or type
      if (paramConfig?.example !== undefined) {
        params[paramName] = String(paramConfig.example);
      } else if (paramConfig?.type === 'number') {
        params[paramName] = '1';
      } else {
        params[paramName] = '';
      }
    }

    return params;
  });

  let pathParamValues = $state<Record<string, string>>(
    (() => {
      const params: Record<string, string> = {};
      const pathParamPattern = /:(\w+)/g;
      let match;

      while ((match = pathParamPattern.exec(path)) !== null) {
        const paramName = match[1];
        const paramConfig = pathParams.find((p) => p.name === paramName);

        if (paramConfig?.example !== undefined) {
          params[paramName] = String(paramConfig.example);
        } else if (paramConfig?.type === 'number') {
          params[paramName] = '1';
        } else {
          params[paramName] = '';
        }
      }

      return params;
    })()
  );

  // Build the final URL with path params replaced
  function buildUrl(): string {
    let finalPath = path;
    Object.entries(pathParamValues).forEach(([key, value]) => {
      finalPath = finalPath.replace(`:${key}`, value);
    });
    return `${baseUrl}${finalPath}`;
  }

  let builtUrl = $derived(buildUrl());

  async function handleSend() {
    loading = true;
    error = null;
    response = null;

    try {
      const url = buildUrl();
      const parsedHeaders = JSON.parse(requestHeaders);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
      };

      if (method !== 'GET' && method !== 'DELETE' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      response = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      };
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }

  let hasPathParams = $derived(Object.keys(pathParamValues).length > 0);
</script>

<div class="not-prose border border-border rounded-lg overflow-hidden bg-card/30">
  <div class="bg-muted/50 px-4 py-2 border-b border-border">
    <h4 class="text-sm font-semibold text-foreground">API Playground</h4>
  </div>

  <div class="p-4 space-y-4">
    <!-- Path Parameters -->
    {#if hasPathParams}
      <div>
        <label class="text-xs font-semibold text-muted-foreground mb-2 block">
          Path Parameters
        </label>
        <div class="space-y-2">
          {#each Object.entries(pathParamValues) as [paramName, paramValue]}
            {@const paramConfig = pathParams.find((p) => p.name === paramName)}
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground min-w-[80px]">
                :{paramName}
              </span>
              <Input
                value={paramValue}
                oninput={(e) => {
                  pathParamValues = { ...pathParamValues, [paramName]: e.currentTarget.value };
                }}
                placeholder={paramConfig?.example || paramConfig?.type || 'value'}
                class="font-mono text-sm"
              />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- URL -->
    <div>
      <label class="text-xs font-semibold text-muted-foreground mb-2 block">
        Request URL
      </label>
      <div class="flex items-center gap-2">
        <Badge variant="outline" class="font-mono">
          {method}
        </Badge>
        <Input value={builtUrl} readonly class="font-mono text-sm" />
      </div>
    </div>

    <!-- Headers -->
    <div>
      <label class="text-xs font-semibold text-muted-foreground mb-2 block">
        Headers (JSON)
      </label>
      <Textarea
        value={requestHeaders}
        oninput={(e) => (requestHeaders = e.currentTarget.value)}
        class="font-mono text-sm"
        rows={4}
      />
    </div>

    <!-- Body (for POST, PUT, PATCH) -->
    {#if method !== 'GET' && method !== 'DELETE'}
      <div>
        <label class="text-xs font-semibold text-muted-foreground mb-2 block">
          Request Body (JSON)
        </label>
        <Textarea
          value={requestBody}
          oninput={(e) => (requestBody = e.currentTarget.value)}
          class="font-mono text-sm"
          rows={6}
          placeholder={'{\n  "key": "value"\n}'}
        />
      </div>
    {/if}

    <!-- Send Button -->
    <Button onclick={handleSend} disabled={loading} class="w-full">
      {#if loading}
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        Sending...
      {:else}
        <Play class="mr-2 h-4 w-4" />
        Send Request
      {/if}
    </Button>

    <!-- Response -->
    {#if response}
      <div class="mt-4">
        <label class="text-xs font-semibold text-muted-foreground mb-2 block">
          Response ({response.status} {response.statusText})
        </label>
        <CodeBlock code={JSON.stringify(response.body, null, 2)} language="json" />
      </div>
    {/if}

    <!-- Error -->
    {#if error}
      <div class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
        <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    {/if}
  </div>
</div>
