/**
 * @module components/crud/CreateForm
 */
import React, { useCallback, useEffect, useRef } from 'react'
import { useForm, Controller, FieldValues, UseFormProps } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import { FormField } from '@/types'

export interface CreateFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: unknown) => void
  schema: FormField[]
  DialogProps?: React.ComponentProps<typeof Dialog>
  title?: string
  cancelLabel?: string
  submitLabel?: string
  FormProps?: UseFormProps<FieldValues>
}

/**
 * The CreateForm component.
 * @param {CreateFormProps} props - The props for the CreateForm component
 * @param {boolean} props.open - Whether the form is open or not
 * @param {FormField[]} props.schema - The schema for the form
 * @param {() => void} props.onClose - The function to call when the form is closed
 * @param {(data: unknown) => void} props.onSubmit - The function to call when the form is submitted
 * @returns {React.JSX.Element}
 * @example
 * <CreateForm
 *  open={open}
 *  schema={[
 *    { id: 'name', field: 'name', label: 'Name', type: 'text', required: true, component: TextField },
 *    { id: 'address', field: 'address', label: 'Address', type: 'text', required: true, component: TextField },
 *  ]}
 *  onClose={handleClose}
 *  onSubmit={handleSubmit}
 * />
 */
const CreateForm: React.FC<CreateFormProps> = ({
  schema,
  open,
  onClose: onCloseProp,
  onSubmit: onSubmitProp,
  title,
  cancelLabel,
  submitLabel,
  DialogProps,
  FormProps,
}): React.JSX.Element => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors = {}, isSubmitting, isValid, isValidating },
  } = useForm<FieldValues>({
    mode: 'all',
    ...FormProps,
  })

  const firstFieldRef = useRef<HTMLInputElement>(null)
  const titleId = 'create-form-title'
  const descriptionId = 'create-form-description'

  const disabled =
    !isValid || isValidating || isSubmitting || Object.keys(errors).length > 0

  // Focus management - focus first field when dialog opens
  useEffect(() => {
    if (open && firstFieldRef.current) {
      setTimeout(() => {
        firstFieldRef.current?.focus()
      }, 100)
    }
  }, [open])

  const onSubmit = useCallback(
    (data: unknown) => {
      if (disabled) return
      onSubmitProp(data)
    },
    [onSubmitProp, disabled]
  )

  const onClose = useCallback(() => {
    if (typeof onCloseProp !== 'function') return
    onCloseProp()
  }, [onCloseProp])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      disableEscapeKeyDown={false}
      {...DialogProps}
    >
      <DialogTitle id={titleId} sx={{ mb: 0 }}>
        {title || 'Create New'}
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          role="form"
          aria-describedby={descriptionId}
        >
          <Stack spacing={4} sx={{ pt: 1 }}>
            {schema.map(({ component: Component, ...field }, index) => {
              // dynamically register the fields
              const { ref: inputRef, ...inputProps } = register(field.name, {
                required: 'This field is required',
              })

              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  rules={{ required: field.required }}
                  defaultValue={field.value}
                  render={({ field: _f, fieldState: { error } }) => (
                    <Component
                      {...field}
                      {...inputProps}
                      inputRef={index === 0 ? firstFieldRef : inputRef}
                      label={field.label}
                      required={field.required}
                      error={!!error}
                      helperText={error ? error?.message : ' '}
                      InputProps={{
                        error: !!error,
                        fullWidth: true,
                        multiline: field.multiline,
                        required: field.required,
                      }}
                    />
                  )}
                />
              )
            })}
          </Stack>
          <DialogActions>
            <Button onClick={onClose} aria-label="cancel form">
              {cancelLabel || 'Cancel'}
            </Button>
            <Button
              disabled={disabled ? true : false}
              variant="contained"
              type="submit"
              onClick={onSubmit}
              role="button"
              aria-label="submit form"
            >
              {submitLabel || 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default CreateForm
