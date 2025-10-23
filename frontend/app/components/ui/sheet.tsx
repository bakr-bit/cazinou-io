'use client'

import * as React from 'react'
import {createPortal} from 'react-dom'
import {cn} from '@/lib/utils'

type SheetContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheetContext(component: string) {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error(`${component} must be used within a <Sheet> component.`)
  }
  return context
}

type SheetProps = {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sheet({children, open: openProp, defaultOpen = false, onOpenChange}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  React.useEffect(() => {
    if (!open) {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      return
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  const contextValue = React.useMemo(() => ({open, setOpen}), [open, setOpen])

  return <SheetContext.Provider value={contextValue}>{children}</SheetContext.Provider>
}

type SheetTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
  children: React.ReactElement
}

export function SheetTrigger({asChild = false, children, ...props}: SheetTriggerProps) {
  const {setOpen, open} = useSheetContext('SheetTrigger')
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & {onClick?: React.MouseEventHandler}
  >

  const composedProps = {
    ...props,
    'aria-expanded': open,
    'data-state': open ? 'open' : 'closed',
    onClick: composeEventHandlers(child.props.onClick, () => setOpen(true)),
  }

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, composedProps)
  }

  return React.cloneElement(child, composedProps)
}

type SheetCloseProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
  children: React.ReactElement
}

export function SheetClose({asChild = false, children, ...props}: SheetCloseProps) {
  const {setOpen} = useSheetContext('SheetClose')
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & {onClick?: React.MouseEventHandler}
  >

  const composedProps = {
    ...props,
    onClick: composeEventHandlers(child.props.onClick, () => setOpen(false)),
  }

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, composedProps)
  }

  return React.cloneElement(child, composedProps)
}

type SheetContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: 'top' | 'bottom' | 'left' | 'right'
  overlayClassName?: string
}

export function SheetContent({
  className,
  side = 'right',
  overlayClassName,
  children,
  ...props
}: SheetContentProps) {
  const {open, setOpen} = useSheetContext('SheetContent')
  const [isMounted, setIsMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(open)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      setVisible(true)
    } else {
      const timeout = window.setTimeout(() => setVisible(false), 200)
      return () => window.clearTimeout(timeout)
    }
  }, [open])

  const handleOverlayClick = () => setOpen(false)

  if (!isMounted || (!open && !visible)) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex">
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
          overlayClassName
        )}
        aria-hidden="true"
        onClick={handleOverlayClick}
      />
      <div
        className={cn(
          'relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl transition-transform duration-200',
          side === 'left' && 'ml-0 mr-auto',
          side === 'right' && (open ? 'translate-x-0' : 'translate-x-full'),
          side === 'left' && (open ? 'translate-x-0' : '-translate-x-full'),
          side === 'top' && 'mx-auto mt-0 h-auto w-full max-w-2xl',
          side === 'bottom' && 'mx-auto mb-0 h-auto w-full max-w-2xl',
          side === 'top' && (open ? 'translate-y-0' : '-translate-y-full'),
          side === 'bottom' && (open ? 'translate-y-0' : 'translate-y-full'),
          className
        )}
        data-state={open ? 'open' : 'closed'}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function SheetHeader({className, ...props}: SheetHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 border-b border-gray-200 px-4 py-3 text-center sm:text-left', className)}
      {...props}
    />
  )
}

type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>

export function SheetFooter({className, ...props}: SheetFooterProps) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:justify-end', className)} {...props} />
  )
}

type SheetTitleProps = React.HTMLAttributes<HTMLHeadingElement>

export function SheetTitle({className, ...props}: SheetTitleProps) {
  return <h2 className={cn('text-sm font-semibold uppercase tracking-wide text-gray-700', className)} {...props} />
}

type SheetDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export function SheetDescription({className, ...props}: SheetDescriptionProps) {
  return <p className={cn('text-sm text-gray-500', className)} {...props} />
}

function composeEventHandlers<E extends {defaultPrevented?: boolean}>(
  originalHandler?: (event: E) => void,
  ourHandler?: (event: E) => void
) {
  return (event: E) => {
    originalHandler?.(event)
    if (!event.defaultPrevented) {
      ourHandler?.(event)
    }
  }
}
