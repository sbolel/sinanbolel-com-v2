/**
 * @module hooks/useDialog
 */
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
} from 'react'
import Dialog, { DialogProps } from '@mui/material/Dialog'

type DialogState = {
  children: React.JSX.Element
  props?: DialogProps | null
}

const DialogContext = createContext<
  [(dialog: DialogState) => void, () => void]
>([
  (dialog: DialogState): void => {
    // HACK: this is a hack to get around the unused variable error
    return dialog as unknown as void
  },
  () => {},
])

const DialogProvider: React.FC<React.PropsWithChildren> = ({
  children,
}): React.JSX.Element => {
  const [
    { children: dialogChildren, props: dialogProps, ...params },
    setDialog,
  ] = useState<DialogState>({ children: <></>, props: null })

  const [open, setOpen] = useState(false)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const openDialog = useCallback((dialog: DialogState) => {
    // Store the currently focused element before opening dialog
    previousActiveElementRef.current = document.activeElement as HTMLElement
    setDialog(dialog)
    setOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setOpen(false)
    // Return focus to the element that was focused before opening dialog
    setTimeout(() => {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }, 100)
  }, [])

  // Focus management effect
  useEffect(() => {
    if (open) {
      // Move focus to first focusable element in dialog after it opens
      setTimeout(() => {
        const dialog = document.querySelector('[role="dialog"]')
        if (dialog) {
          const firstFocusable = dialog.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          if (firstFocusable) {
            firstFocusable.focus()
          }
        }
      }, 100)
    }
  }, [open])

  const contextValue = useRef<[(dialog: DialogState) => void, () => void]>([
    openDialog,
    closeDialog,
  ])

  return (
    <DialogContext.Provider value={contextValue.current}>
      {children}
      <Dialog
        {...dialogProps}
        onClose={closeDialog}
        open={open}
        aria-labelledby={dialogProps?.['aria-labelledby'] || 'dialog-title'}
        aria-describedby={
          dialogProps?.['aria-describedby'] || 'dialog-description'
        }
        disableEscapeKeyDown={false}
        keepMounted={false}
      >
        {Children.map(dialogChildren, (child) => {
          // Checking isValidElement is the safe way and avoids a
          // typescript error too.
          const combinedProps = {
            ...params,
            setOpen,
          }
          if (isValidElement(child)) {
            return cloneElement(child, combinedProps)
          }
          return child
        })}
      </Dialog>
    </DialogContext.Provider>
  )
}

export const useDialog = () => {
  const result = useContext(DialogContext)
  if (!result) {
    throw new Error('Dialog context is only available inside its provider')
  }
  return result
}

export default DialogProvider
