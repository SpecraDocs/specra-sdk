"use client"

import { ReactNode } from "react"
import { useTabContext } from "./tab-context"

interface TabStateInjectorProps {
  children: (activeTabGroup: string, onTabChange: (tabId: string) => void) => ReactNode
}

/**
 * IMPORTANT: This uses render props which CREATES A CLIENT BOUNDARY.
 * Do NOT use this to wrap Server Components with async content.
 * Only use for passing state to sibling components or props.
 */
export function TabStateInjector({ children }: TabStateInjectorProps) {
  const { activeTabGroup, setActiveTabGroup } = useTabContext()
  return <>{children(activeTabGroup, setActiveTabGroup)}</>
}
