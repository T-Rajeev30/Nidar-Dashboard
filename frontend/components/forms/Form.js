import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import { Label } from '../ui/label';

export function Form({ children, ...form }) {
  return <FormProvider {...form}>{children}</FormProvider>;
}

export function FormField({ name, control, children }) {
  return <Controller name={name} control={control} render={children} />;
}

export function FormError({ name }) {
  const { formState: { errors } } = useFormContext();
  const message = errors[name]?.message;
  return message ? <p className="field-error" role="alert">{message}</p> : null;
}

export function FormLabel({ htmlFor, children }) {
  return <Label htmlFor={htmlFor}>{children}</Label>;
}
