/**
 * MDX/mdsvex component map for Specra documentation.
 *
 * In mdsvex, custom components are imported directly in .svx files.
 * This file exports the component map for programmatic use.
 *
 * Usage in .svx files:
 * ```svelte
 * <script>
 *   import { Callout, CodeBlock, Tabs, Tab } from 'specra/components'
 * </script>
 *
 * <Callout type="info">This is a callout</Callout>
 * ```
 */

import {
  Callout,
  Accordion,
  AccordionItem,
  Tabs,
  Tab,
  Image,
  Video,
  Card,
  CardGrid,
  ImageCard,
  ImageCardGrid,
  Steps,
  Step,
  Icon,
  Mermaid,
  Math,
  Columns,
  Column,
  DocBadge,
  Tooltip,
  Frame,
  CodeBlock,
  ApiEndpoint,
  ApiParams,
  ApiResponse,
  ApiPlayground,
  ApiReference,
} from './components/docs'

// Re-export all MDX-usable components
export {
  Callout,
  Accordion,
  AccordionItem,
  Tabs,
  Tab,
  Image,
  Video,
  Card,
  CardGrid,
  ImageCard,
  ImageCardGrid,
  Steps,
  Step,
  Icon,
  Mermaid,
  Math,
  Columns,
  Column,
  DocBadge,
  Tooltip,
  Frame,
  CodeBlock,
  ApiEndpoint,
  ApiParams,
  ApiResponse,
  ApiPlayground,
  ApiReference,
}

/**
 * Component map for passing to layout components that render MDX content.
 */
export const mdxComponents = {
  Callout,
  Accordion,
  AccordionItem,
  Tabs,
  Tab,
  Image,
  Video,
  Card,
  CardGrid,
  ImageCard,
  ImageCardGrid,
  Steps,
  Step,
  Icon,
  Mermaid,
  Math,
  Columns,
  Column,
  Badge: DocBadge,
  DocBadge,
  Tooltip,
  Frame,
  CodeBlock,
  ApiEndpoint,
  ApiParams,
  ApiResponse,
  ApiPlayground,
  ApiReference,
}
