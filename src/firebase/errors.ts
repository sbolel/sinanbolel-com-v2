export const firebaseErrorCode = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = error.code
    if (
      typeof code === 'string' &&
      /^(?:(?:auth|firestore|chat)\/)?[a-z-]+$/.test(code)
    ) {
      return code
    }
  }
  return 'unknown'
}

export const logFirebaseError = (operation: string, error: unknown): void => {
  console.error(operation, firebaseErrorCode(error))
}
