import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const Form = FormProvider

interface FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext)
	const itemContext = React.useContext(FormItemContext)
	const { getFieldState, formState } = useFormContext()

	const fieldState = getFieldState(fieldContext.name, formState)

	if (fieldContext === null || fieldContext === undefined) {
		throw new Error('useFormField should be used within <FormField>')
	}

	const { id } = itemContext

	return {
		name: fieldContext.name,
		id,
		formMessageId: `${id}-form-item-message`,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		...fieldState,
	}
}

interface FormItemContextValue {
	id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const id = React.useId()

		return (
			<FormItemContext.Provider value={{ id }}>
				<div className={cn('space-y-2', className)} ref={ref} {...props} />
			</FormItemContext.Provider>
		)
	}
)
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
	const { formItemId, error } = useFormField()

	return <Label className={cn(error && 'text-destructive', className)} htmlFor={formItemId} ref={ref} {...props} />
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
	({ ...props }, ref) => {
		const { formMessageId, formItemId, formDescriptionId, error } = useFormField()

		return (
			<Slot
				aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
				aria-invalid={!!error}
				id={formItemId}
				ref={ref}
				{...props}
			/>
		)
	}
)
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, ...props }, ref) => {
		const { formDescriptionId } = useFormField()

		return <p className={cn('text-muted-foreground text-sm', className)} id={formDescriptionId} ref={ref} {...props} />
	}
)
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, children, ...props }, ref) => {
		const { formMessageId, error } = useFormField()
		const body = error !== null && error !== undefined ? String(error?.message) : children

		if (body === null || body === undefined) {
			return null
		}

		return (
			<p className={cn('text-destructive text-sm font-medium', className)} id={formMessageId} ref={ref} {...props}>
				{body}
			</p>
		)
	}
)
FormMessage.displayName = 'FormMessage'

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField }
