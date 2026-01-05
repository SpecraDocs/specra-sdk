"use client"

import Link from "next/link"
import { TabGroups } from "./tab-groups"
import { SidebarMenuItems } from "./sidebar-menu-items"
import { Logo } from "./logo"
import { useSidebarState } from "./sidebar-state-provider"
import type { SpecraConfig } from "@/lib/config"
import type { Doc } from "@/lib/mdx"

interface MobileSidebarProps {
  docs: Doc[]
  version: string
  config: SpecraConfig
  activeTabGroup?: string
  onTabChange?: (tabId: string) => void
}

export function MobileSidebar({ docs, version, config, activeTabGroup, onTabChange }: MobileSidebarProps) {
  const { isOpen, setIsOpen } = useSidebarState()

  const handleTabChange = (tabId: string) => {
    onTabChange?.(tabId)
  }

  const handleClose = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Site Title Header */}
          <div className="shrink-0 px-4 py-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2 group justify-center">
              {!config.site?.hideLogo && (
                <Logo
                  logo={config.site?.logo}
                  alt={config.site?.title || "Logo"}
                  className="w-18 object-contain"
                />
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {config.site?.title || "Documentation"}
                </span>
                {config.site?.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {config.site.description}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Documentation Label */}
          <div className="shrink-0 px-4 pt-4 pb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              Documentation
            </h2>
          </div>

          {/* Tab Groups Dropdown - Mobile Only */}
          {config.navigation?.tabGroups && config.navigation.tabGroups.length > 0 && (
            <div className="shrink-0 px-4 py-3 border-b border-border">
              <TabGroups
                tabGroups={config.navigation.tabGroups}
                activeTabId={activeTabGroup}
                onTabChange={handleTabChange}
                mobileOnly
                docs={docs}
                version={version}
              />
            </div>
          )}

          {/* Sidebar Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <SidebarMenuItems
              docs={docs}
              version={version}
              config={config}
              onLinkClick={handleClose}
              activeTabGroup={activeTabGroup}
            />
          </div>
        </div>
      </div>
    </>
  )
}
