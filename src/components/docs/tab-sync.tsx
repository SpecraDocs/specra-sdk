"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // If no tab groups configured, nothing to do
    if (!config.navigation?.tabGroups || config.navigation.tabGroups.length === 0) {
      return
    }

    // Check if there's a tab parameter in the URL (from search result click)
    const urlTabGroup = searchParams.get('tab')

    // Initialize with urlTabGroup, currentPageTabGroup, or first tab on first load
    if (!hasInitialized.current) {
      const initialTab = urlTabGroup || currentPageTabGroup || config.navigation.tabGroups[0]?.id
      if (initialTab && initialTab !== activeTabGroup) {
        setActiveTabGroup(initialTab)
      }
      hasInitialized.current = true
      return
    }

    // Priority: URL tab parameter > page's tab group
    // If URL has explicit tab parameter, switch to it
    if (urlTabGroup && urlTabGroup !== activeTabGroup) {
      setActiveTabGroup(urlTabGroup)
      return
    }

    // After initialization, only sync if the page's tab group doesn't match the active tab
    // AND the page actually has a tab group (this handles navigation to pages with different tab groups)
    if (currentPageTabGroup && currentPageTabGroup !== activeTabGroup) {
      setActiveTabGroup(currentPageTabGroup)
    }
  }, [currentPageTabGroup, setActiveTabGroup, activeTabGroup, config.navigation?.tabGroups, searchParams])

  return null
}
