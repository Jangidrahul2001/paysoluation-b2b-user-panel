"use client"
import React from "react"
import { useNavigate } from "react-router-dom"
import { MoveLeft } from "lucide-react"
import { Button } from "../ui/Button"
import { SidebarPageTransition } from "./sidebar-PageTransition"
import { cn } from "../../lib/utils"

/**
 * Reusable Page Layout with Header, Back Button, Actions, and Animated Transitions
 * @param {string} title - Main title of the page
 * @param {string} subtitle - Optional descriptive subtitle
 * @param {React.ReactNode} children - Main content content
 * @param {React.ReactNode} actions - Optional header actions (buttons, etc)
 * @param {boolean} showBackButton - Whether to show the back button
 * @param {string} className - Optional className for the main container
 */
export function PageLayout({
  title,
  subtitle,
  children,
  actions,
  showBackButton = false,
  onBack,
  className
}) {
  const navigate = useNavigate()

  return (
    <SidebarPageTransition className={cn("flex flex-col gap-6 font-sans", className)}>
      {/* Header Section */}
      {(title || actions || showBackButton) && (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start md:items-start gap-4 md:gap-5 w-full md:w-auto">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onBack ? onBack() : navigate(-1)}
                className="rounded-xl h-10 w-10 hover:bg-indigo-600/5 transition-all text-slate-600 flex-shrink-0 border border-slate-200/50"
              >
                <MoveLeft className="w-5 h-5" />
              </Button>
            )}

            {(title || subtitle) && (
              <div className="flex flex-col items-center md:items-start pt-1 w-full md:w-auto text-center md:text-left pl-4">
                  {title && (
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-slate-500 text-[14px] md:text-[15px] font-medium mt-1.5 max-w-[320px] md:max-w-none leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>
            )}
          </div>

          {actions && (
            <div className="flex items-center justify-center md:justify-end gap-3 pr-0.5 flex-wrap w-full md:w-auto pt-1">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6 pb-20 md:pb-10">
        {children}
      </div>
    </SidebarPageTransition>
  )
}
