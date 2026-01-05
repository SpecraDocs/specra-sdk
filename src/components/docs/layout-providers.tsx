"use client"

import { ReactNode } from "react"
import { SidebarStateProvider } from "./sidebar-state-provider"
import { TabProvider } from "./tab-context"
import { TabSync } from "./tab-sync"
import type { SpecraConfig } from "@/lib/config"

interface LayoutProvidersProps {
  children: ReactNode
  currentPageTabGroup?: string
  config: SpecraConfig
}

/**
 * Client component that wraps children with all necessary context providers.
 * This creates a client boundary but doesn't interfere with Server Component children.
 */
export function LayoutProviders({ children, currentPageTabGroup, config }: LayoutProvidersProps) {
  // Get default tab from config
  const defaultTab = config.navigation?.tabGroups?.[0]?.id || ""

  return (
    <TabProvider defaultTab={defaultTab}>
      <SidebarStateProvider>
        <TabSync currentPageTabGroup={currentPageTabGroup} config={config} />
        {children}
      </SidebarStateProvider>
    </TabProvider>
  )
}
