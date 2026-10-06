import React from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Crumb } from "./types"
import { Skeleton } from "@/components/ui/skeleton"

export function HeaderBreadcrumb({ trail, className }: { trail: Crumb[]; className?: string }) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1
          
          return (
            <React.Fragment key={crumb.key}>
              <BreadcrumbItem>
                {isLast ? (
                  crumb.label ? (
                    <BreadcrumbPage className="max-w-50 truncate font-medium text-foreground">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <Skeleton className="h-4 w-24" />
                  )
                ) : (
                  crumb.label ? (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <Skeleton className="h-4 w-24" />
                  )
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
