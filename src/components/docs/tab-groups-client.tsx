"use client"

import { TabGroups } from "./tab-groups"
import type { TabGroup } from "@/lib/config.types"

interface TabGroupsClientProps {
  tabGroups: TabGroup[]
  activeTabId?: string
  docs?: Array<{ slug: string; meta?: { tab_group?: string }; categoryTabGroup?: string }>
  version?: string
}

/**
 * Client wrapper for TabGroups to isolate client-side behavior
 * from the server component tree
 */
export function TabGroupsClient({ tabGroups, activeTabId, docs, version }: TabGroupsClientProps) {
  return (
    <TabGroups
      tabGroups={tabGroups}
      activeTabId={activeTabId}
      onTabChange={() => {}}
      docs={docs}
      version={version}
    />
  )
}
