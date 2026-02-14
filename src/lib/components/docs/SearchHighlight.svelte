<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  const searchQuery = $derived($page.url.searchParams.get('q') || $page.url.searchParams.get('query') || '');

  $effect(() => {
    if (!browser || !searchQuery) return;

    // Wait for content to render
    const timer = setTimeout(() => {
      highlightSearchTerms(searchQuery);
    }, 100);

    return () => {
      clearTimeout(timer);
      removeHighlights();
    };
  });

  function highlightSearchTerms(query: string) {
    if (!query.trim()) return;

    // Remove any existing highlights first
    removeHighlights();

    const contentEl = document.querySelector('[data-doc-content]') || document.querySelector('.prose') || document.querySelector('main');
    if (!contentEl) return;

    const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        // Skip script, style, and already-highlighted nodes
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tagName = parent.tagName.toLowerCase();
        if (tagName === 'script' || tagName === 'style' || tagName === 'code' || tagName === 'pre') {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.classList.contains('search-highlight')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes: Text[] = [];
    let currentNode: Node | null;
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode as Text);
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    let firstHighlight: HTMLElement | null = null;

    for (const textNode of textNodes) {
      const text = textNode.textContent || '';
      if (!regex.test(text)) continue;

      // Reset regex lastIndex
      regex.lastIndex = 0;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        // Add highlighted match
        const mark = document.createElement('mark');
        mark.className = 'search-highlight bg-primary/20 text-primary rounded-sm px-0.5';
        mark.textContent = match[1];
        fragment.appendChild(mark);

        if (!firstHighlight) {
          firstHighlight = mark;
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);
    }

    // Scroll to first highlight
    if (firstHighlight) {
      setTimeout(() => {
        firstHighlight?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }

  function removeHighlights() {
    if (!browser) return;
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
  }
</script>

<!-- SearchHighlight is a side-effect only component, no visible output -->
