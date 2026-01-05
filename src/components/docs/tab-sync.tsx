"use client"

import { useEffect, useRef } from "react"
import { useTabContext } from "./tab-context"
import type { SpecraConfig } from "@/lib/config"

interface TabSyncProps {
  currentPageTabGroup?: string
  config: SpecraConfig
}

/**
 * Client component that syncs tab state based on current page.
 * This is a zero-render component that only runs effects.
 */
export function TabSync({ currentPageTabGroup, config }: TabSyncProps) {
  const { activeTabGroup, setActiveTabGroup } = useTabContext()
  const lastPageTabGroupRef = useRef<string | undefined>(undefined)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // If no tab groups configured, nothing to do
    if (!config.navigation?.tabGroups || config.navigation.tabGroups.length === 0) {
      return
    }

    // If we have a currentPageTabGroup, always sync to it
    if (currentPageTabGroup) {
      // Only update if it's different from the last one we set
      if (lastPageTabGroupRef.current !== currentPageTabGroup) {
        setActiveTabGroup(currentPageTabGroup)
        lastPageTabGroupRef.current = currentPageTabGroup
        hasInitialized.current = true
      }
      return
    }

    // If no currentPageTabGroup but we haven't initialized yet, set to first tab
    if (!hasInitialized.current && !activeTabGroup) {
      const firstTab = config.navigation.tabGroups[0]?.id
      if (firstTab) {
        setActiveTabGroup(firstTab)
        lastPageTabGroupRef.current = firstTab
        hasInitialized.current = true
      }
    }
  }, [currentPageTabGroup, setActiveTabGroup, activeTabGroup, config.navigation?.tabGroups])

  return null
}
