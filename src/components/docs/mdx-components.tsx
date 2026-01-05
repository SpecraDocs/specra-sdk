
import type { ReactNode } from "react"
import { createMdxPrimitives } from "./mdx-primitives"
import { Callout } from "./callout"
import { Video } from "./video"
import { Card, CardGrid } from "./card"
import { ImageCard, ImageCardGrid } from "./image-card"
import { Steps, Step } from "./steps"
import { Columns, Column } from "./columns"
import { Badge } from "./badge"
import { Tooltip } from "./tooltip"
import { Frame } from "./frame"
import { CodeBlock } from "./code-block"
import { Accordion, AccordionItem } from "./accordion"
import { Tabs, Tab } from "./tabs"
import { Image } from "./image"
import { Icon } from "./icon"
import { Mermaid } from "./mermaid"
import { Math } from "./math"
import { ApiEndpoint, ApiParams, ApiResponse, ApiPlayground, ApiReference } from "./api"

export const mdxComponents = {
  ...createMdxPrimitives({ CodeBlock }),
  CodeBlock,
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
  Badge,
  Tooltip,
  Frame,
  ApiEndpoint,
  ApiParams,
  ApiResponse,
  ApiPlayground,
  ApiReference,
}

export default mdxComponents