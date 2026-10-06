"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  BadgeCarouselButtonProps,
  BadgeCarouselContextValue,
  BadgeCarouselControlsProps,
  BadgeCarouselProps,
} from "./types"

const BadgeCarouselContext = React.createContext<BadgeCarouselContextValue<unknown> | null>(null)

export function useBadgeCarousel<T = string>() {
  const context = React.useContext(BadgeCarouselContext)
  if (!context) {
    throw new Error("useBadgeCarousel must be used within a <BadgeCarousel />")
  }
  return context as unknown as BadgeCarouselContextValue<T>
}

/**
 * 1. BadgeCarouselLeft: Botão de navegação para a esquerda.
 */
export function BadgeCarouselLeft({
  className,
  variant = "ghost",
  size = "icon-xs",
  disabled,
  ...props
}: BadgeCarouselButtonProps) {
  const { scrollPrev, canScrollPrev } = useCarousel()
  const isDisabled = disabled ?? !canScrollPrev

  return (
    <Button
      type="button"
      data-slot="badge-carousel-left"
      variant={variant}
      size={size}
      onClick={scrollPrev}
      disabled={isDisabled}
      className={cn(
        "size-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-opacity",
        className
      )}
      aria-label="Rolar opções para a esquerda"
      {...props}
    >
      <ChevronLeft className="size-3.5" />
    </Button>
  )
}

/**
 * 2. BadgeCarouselRight: Botão de navegação para a direita.
 */
export function BadgeCarouselRight({
  className,
  variant = "ghost",
  size = "icon-xs",
  disabled,
  ...props
}: BadgeCarouselButtonProps) {
  const { scrollNext, canScrollNext } = useCarousel()
  const isDisabled = disabled ?? !canScrollNext

  return (
    <Button
      type="button"
      data-slot="badge-carousel-right"
      variant={variant}
      size={size}
      onClick={scrollNext}
      disabled={isDisabled}
      className={cn(
        "size-6 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-opacity",
        className
      )}
      aria-label="Rolar opções para a direita"
      {...props}
    >
      <ChevronRight className="size-3.5" />
    </Button>
  )
}

/**
 * 3. BadgeCarouselControls: Agrupador dos controles de navegação (Left + Right).
 */
export function BadgeCarouselControls({
  className,
  children,
  ...props
}: BadgeCarouselControlsProps) {
  return (
    <div
      data-slot="badge-carousel-controls"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    >
      {children ?? (
        <>
          <BadgeCarouselLeft />
          <BadgeCarouselRight />
        </>
      )}
    </div>
  )
}

/**
 * 4. BadgeCarouselContent: Viewport e slides dos badges/pills.
 */
export function BadgeCarouselContent({
  className,
  itemClassName,
  ...props
}: React.ComponentProps<"div"> & { itemClassName?: string }) {
  const { options, isSelected, handleToggle, disabled, itemClassName: contextItemClassName } =
    useBadgeCarousel()
  const { api } = useCarousel()

  const finalItemClassName = itemClassName ?? contextItemClassName

  const isDraggingRef = React.useRef(false)
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null)

  React.useEffect(() => {
    if (!api) return

    const onScroll = () => {
      isDraggingRef.current = true
    }

    const onPointerDown = () => {
      isDraggingRef.current = false
    }

    const onPointerUp = () => {
      setTimeout(() => {
        isDraggingRef.current = false
      }, 150)
    }

    api.on("scroll", onScroll)
    api.on("pointerDown", onPointerDown)
    api.on("pointerUp", onPointerUp)

    return () => {
      api.off("scroll", onScroll)
      api.off("pointerDown", onPointerDown)
      api.off("pointerUp", onPointerUp)
    }
  }, [api])

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return
    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
    if (dx > 6 || dy > 6) {
      isDraggingRef.current = true
    }
  }

  const handlePointerUp = () => {
    setTimeout(() => {
      isDraggingRef.current = false
    }, 150)
    pointerStartRef.current = null
  }

  return (
    <CarouselContent
      data-slot="badge-carousel-content"
      data-base-ui-swipe-ignore=""
      data-swipe-ignore=""
      data-vaul-no-drag=""
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "pan-y" }}
      className={cn(
        "-ml-1.5 py-0.5 select-none touch-pan-y cursor-grab active:cursor-grabbing",
        className
      )}
      {...props}
    >
      {options.map((option) => {
        const selected = isSelected(option.value)
        const optionDisabled = disabled || option.disabled

        return (
          <CarouselItem
            key={String(option.value)}
            className="basis-auto shrink-0 pl-1.5"
            data-slot="badge-carousel-item"
            data-base-ui-swipe-ignore=""
            data-swipe-ignore=""
            data-vaul-no-drag=""
            style={{ touchAction: "pan-y" }}
          >
            <Toggle
              type="button"
              size="sm"
              variant="outline"
              pressed={selected}
              disabled={optionDisabled}
              data-base-ui-swipe-ignore=""
              data-swipe-ignore=""
              data-vaul-no-drag=""
              style={{ touchAction: "pan-y" }}
              onPressedChange={() => {
                if (isDraggingRef.current) return
                handleToggle(option.value)
              }}
              className={cn(
                "text-xs h-7 px-3 rounded-full transition-all border-border/80 whitespace-nowrap touch-pan-y",
                selected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                finalItemClassName
              )}
            >
              {option.icon}
              {option.label}
            </Toggle>
          </CarouselItem>
        )
      })}
    </CarouselContent>
  )
}

/**
 * Componente Raiz: BadgeCarousel (compatível com DataForm)
 */
export function BadgeCarousel<T = string>({
  id,
  options,
  value,
  onChange,
  onBlur,
  multiple = false,
  disabled = false,
  className,
  itemClassName,
  children,
  ref,
  "aria-invalid": ariaInvalid,
}: BadgeCarouselProps<T>) {
  const handleToggle = React.useCallback(
    (optionValue: T) => {
      if (disabled) return

      if (multiple) {
        const currentValues = Array.isArray(value) ? [...value] : []
        const index = currentValues.indexOf(optionValue)
        const nextValues =
          index >= 0
            ? currentValues.filter((v) => v !== optionValue)
            : [...currentValues, optionValue]

        ;(onChange as ((val: T[] | undefined) => void) | undefined)?.(
          nextValues.length > 0 ? nextValues : undefined
        )
      } else {
        const isCurrentlySelected = value === optionValue
        ;(onChange as ((val: T | undefined) => void) | undefined)?.(
          isCurrentlySelected ? undefined : optionValue
        )
      }

      onBlur?.()
    },
    [disabled, multiple, value, onChange, onBlur]
  )

  const isSelected = React.useCallback(
    (optionValue: T) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(optionValue)
      }
      return value === optionValue
    },
    [multiple, value]
  )

  const contextValue = React.useMemo<BadgeCarouselContextValue<T>>(
    () => ({
      options,
      value,
      multiple: Boolean(multiple),
      disabled: Boolean(disabled),
      isSelected,
      handleToggle,
      itemClassName,
    }),
    [options, value, multiple, disabled, isSelected, handleToggle, itemClassName]
  )

  return (
    <BadgeCarouselContext.Provider value={contextValue as BadgeCarouselContextValue<unknown>}>
      <Carousel
        ref={ref}
        id={id}
        opts={{
          dragFree: true,
          containScroll: "trimSnaps",
          align: "start",
          watchDrag: true,
        }}
        aria-invalid={ariaInvalid}
        data-slot="badge-carousel"
        data-base-ui-swipe-ignore=""
        data-swipe-ignore=""
        data-vaul-no-drag=""
        className={cn("w-full flex flex-col gap-1.5 min-w-0 select-none", className)}
      >
        {children ?? <BadgeCarouselContent />}
      </Carousel>
    </BadgeCarouselContext.Provider>
  )
}

// Aliases para conveniência
export { BadgeCarouselLeft as BadgeCarouselButtonLeft }
export { BadgeCarouselRight as BadgeCarouselButtonRight }
export { BadgeCarousel as CarouselSelect }
export * from "./types"
