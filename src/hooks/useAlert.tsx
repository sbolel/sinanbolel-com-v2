/**
 * @module hooks/useAlert
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { AlertColor } from '@mui/material/Alert'
import { DEFAULT_ALERT_TIMEOUT } from '@/constants'

export type AlertProps = {
  severity?: AlertColor
  message?: string
  autoHide?: boolean
  timeout?: number
}

export type AlertState = {
  isVisible: boolean
  message: string
  severity: AlertColor
}

export type AlertContextType = {
  state: AlertState
  clearAlert: () => void
  setAlert: (values: AlertProps) => void
  setData: (values: AlertState) => void
}

// Actions for the alert reducer
type AlertAction =
  | { type: 'SHOW_ALERT'; payload: Partial<AlertState> }
  | { type: 'HIDE_ALERT' }
  | { type: 'SET_DATA'; payload: Partial<AlertState> }

// Initial state
const INITIAL_STATE = {
  isVisible: false,
  message: '',
  severity: 'info' as AlertColor,
} as AlertState

// Default context
const defaultContext: AlertContextType = {
  state: INITIAL_STATE,
  setData: () => null,
  setAlert: () => null,
  clearAlert: () => null,
}

// Alert reducer to handle state updates
const alertReducer = (state: AlertState, action: AlertAction): AlertState => {
  switch (action.type) {
    case 'SHOW_ALERT':
      return {
        ...state,
        isVisible: true,
        ...(action.payload || {}),
      }
    case 'HIDE_ALERT':
      return {
        ...INITIAL_STATE,
      }
    case 'SET_DATA':
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

export const AlertContext = createContext<AlertContextType>(defaultContext)

export type AlertProviderOverrideProps = {
  initialState?: AlertState
  contextOverrides?: Partial<AlertContextType>
}

export type AlertProviderProps = {
  children: React.JSX.Element
} & AlertProviderOverrideProps

// Custom hook to manage timeout
const useAlertTimeout = () => {
  // Store and manage timeout ID
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear existing timeout
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      global.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Set new timeout
  const setTimeout = useCallback(
    (callback: () => void, delay: number) => {
      // Clear any existing timeout first
      clearTimeout()
      timeoutRef.current = global.setTimeout(callback, delay)
    },
    [clearTimeout]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout()
    }
  }, [clearTimeout])

  return { setTimeout, clearTimeout }
}

export const AlertProvider = ({
  children,
  initialState = INITIAL_STATE,
  contextOverrides = {},
}: AlertProviderProps): React.JSX.Element => {
  // Use reducer for state management
  const [state, dispatch] = useReducer(alertReducer, initialState)
  const isControlled = Object.keys(contextOverrides).length > 0

  // Use timeout hook
  const { setTimeout, clearTimeout } = useAlertTimeout()

  // Clear alert handler
  const clearAlert = useCallback(() => {
    if (isControlled && contextOverrides?.clearAlert) {
      contextOverrides.clearAlert?.()
    }

    dispatch({ type: 'HIDE_ALERT' })
    clearTimeout()
  }, [contextOverrides, isControlled, clearTimeout])

  // Set alert handler
  const setAlert = useCallback(
    ({
      autoHide = true,
      message = state.message || '',
      severity = state.severity || 'info',
      timeout = DEFAULT_ALERT_TIMEOUT,
    }: AlertProps) => {
      if (isControlled && contextOverrides?.setAlert) {
        contextOverrides.setAlert?.({
          autoHide,
          message,
          severity,
          timeout,
        })
      }

      dispatch({
        type: 'SHOW_ALERT',
        payload: { message, severity },
      })

      if (autoHide) {
        setTimeout(clearAlert, timeout)
      }
    },
    [
      clearAlert,
      contextOverrides,
      isControlled,
      state.message,
      state.severity,
      setTimeout,
    ]
  )

  // Set data handler
  const setData = useCallback(
    (values: AlertState) => {
      if (isControlled && contextOverrides?.setData) {
        contextOverrides.setData?.(values)
      }

      dispatch({
        type: 'SET_DATA',
        payload: values,
      })
    },
    [contextOverrides, isControlled]
  )

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      state,
      setData,
      setAlert,
      clearAlert,
    }),
    [state, setData, setAlert, clearAlert]
  )

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
    </AlertContext.Provider>
  )
}

export const useAlert = () => useContext(AlertContext)

export default useAlert
