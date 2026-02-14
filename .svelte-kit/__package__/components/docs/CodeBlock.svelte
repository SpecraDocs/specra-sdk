<script lang="ts">
  import { Copy, Check } from 'lucide-svelte';

  interface Props {
    code: string;
    language: string;
    filename?: string;
  }

  let { code, language, filename }: Props = $props();

  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      copied = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
    });
  }

  // Basic syntax tokenizer matching the React version's pattern-based approach
  interface Token {
    type: string;
    value: string;
  }

  function tokenizeLine(line: string): Token[] {
    const tokens: Token[] = [];
    let currentPos = 0;

    const patterns: Array<{ type: string; regex: RegExp }> = [
      { type: 'comment', regex: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/ },
      { type: 'string', regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/ },
      {
        type: 'keyword',
        regex:
          /\b(const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|default|import|export|from|as|class|extends|implements|interface|type|enum|namespace|async|await|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|abstract|void|null|undefined|true|false|typeof|instanceof|delete|in|of)\b/,
      },
      { type: 'operator', regex: /([+\-*/%=<>!&|^~?:]+)/ },
      { type: 'number', regex: /\b(0x[a-fA-F0-9]+|0b[01]+|\d+\.?\d*(?:e[+-]?\d+)?)\b/ },
      { type: 'function', regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/ },
      { type: 'property', regex: /\.([a-zA-Z_$][\w$]*)/ },
      { type: 'punctuation', regex: /([{}[\]();,])/ },
    ];

    while (currentPos < line.length) {
      let matched = false;

      for (const { type, regex } of patterns) {
        const match = line.slice(currentPos).match(regex);
        if (match && match.index === 0) {
          tokens.push({ type, value: match[0] });
          currentPos += match[0].length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        const nextSpecialChar = line.slice(currentPos).search(/["'`/\w.+\-*/%=<>!&|^~?:;,()[\]{}#]/);
        if (nextSpecialChar === -1) {
          tokens.push({ type: 'text', value: line.slice(currentPos) });
          break;
        } else if (nextSpecialChar > 0) {
          tokens.push({ type: 'text', value: line.slice(currentPos, currentPos + nextSpecialChar) });
          currentPos += nextSpecialChar;
        } else {
          tokens.push({ type: 'text', value: line[currentPos] });
          currentPos++;
        }
      }
    }

    return tokens;
  }

  let lines = $derived(code.split('\n'));
</script>

<div class="relative group my-2">
  <!-- Header - always visible -->
  <div class="bg-muted/50 dark:bg-muted/30 px-4 py-2 rounded-t-xl border border-b-0 border-border/50 flex items-center justify-between">
    <!-- Left section: Safari-style dots + filename -->
    <div class="flex items-center gap-3">
      <!-- Safari-style window controls -->
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full bg-red-500/80 dark:bg-red-500/60"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500/80 dark:bg-yellow-500/60"></div>
        <div class="w-3 h-3 rounded-full bg-green-500/80 dark:bg-green-500/60"></div>
      </div>
      <!-- Filename or "Code" -->
      <span class="text-xs font-mono text-foreground">{filename || 'Code'}</span>
    </div>

    <!-- Right section: Language + Copy button -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground/60 font-mono uppercase tracking-wide">{language}</span>
      <button
        onclick={handleCopy}
        class="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
        aria-label="Copy code"
      >
        {#if copied}
          <Check class="h-4 w-4 text-green-400" />
        {:else}
          <Copy class="h-4 w-4 text-muted-foreground" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Code content -->
  <div class="bg-gray-200/50 dark:bg-[#0d1117] rounded-b-xl overflow-x-auto border border-border/50">
    <pre class="p-2 text-[13px] font-mono leading-relaxed text-gray-800 dark:text-gray-200"><code class="table w-full">{#each lines as line, i}{@const isDeletion = line.startsWith('-')}{@const isAddition = line.startsWith('+')}{@const isDiff = isDeletion || isAddition}{@const diffBgClass = isDeletion ? 'bg-red-500/5 dark:bg-red-500/10' : isAddition ? 'bg-green-500/5 dark:bg-green-500/10' : ''}{@const diffMarkerClass = isDeletion ? 'text-red-600 dark:text-red-400' : isAddition ? 'text-green-600 dark:text-green-400' : ''}{@const tokens = tokenizeLine(line)}<div class="table-row {diffBgClass}"><span class="table-cell pr-4 text-right select-none text-muted-foreground/40 w-8 align-top">{i + 1}</span><span class="table-cell align-top">{#if tokens.length === 0}&nbsp;{:else}{#each tokens as token, j}{#if j === 0 && isDiff && token.value.length > 0 && (token.value[0] === '+' || token.value[0] === '-')}<span class="{diffMarkerClass} font-bold">{token.value[0]}</span>{#if token.value.length > 1}<span class="token-{token.type}">{token.value.slice(1)}</span>{/if}{:else}<span class="token-{token.type}">{token.value}</span>{/if}{/each}{/if}</span></div>{/each}</code></pre>
  </div>
</div>

<style>
  .token-keyword {
    color: #cf222e;
  }
  :global(.dark) .token-keyword {
    color: #ff7b72;
  }
  .token-string {
    color: #0a3069;
  }
  :global(.dark) .token-string {
    color: #a5d6ff;
  }
  .token-comment {
    color: #6e7781;
    font-style: italic;
  }
  :global(.dark) .token-comment {
    color: #8b949e;
  }
  .token-number {
    color: #0550ae;
  }
  :global(.dark) .token-number {
    color: #79c0ff;
  }
  .token-function {
    color: #8250df;
  }
  :global(.dark) .token-function {
    color: #d2a8ff;
  }
  .token-operator {
    color: #cf222e;
  }
  :global(.dark) .token-operator {
    color: #ff7b72;
  }
  .token-property {
    color: #0550ae;
  }
  :global(.dark) .token-property {
    color: #79c0ff;
  }
  .token-punctuation {
    color: #24292f;
  }
  :global(.dark) .token-punctuation {
    color: #c9d1d9;
  }
</style>
