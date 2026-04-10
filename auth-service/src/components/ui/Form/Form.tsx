// src/components/ui/Form/Form.tsx
import * as React from 'react';
import { FormProvider, useForm } from './FormContent';
import './Form.css';

// Определяем тип для input элемента
type InputElement = React.ReactElement<{
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}>;

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  validationSchema?: Record<string, (value: any) => string | undefined>;
  children: React.ReactNode;
}

const FormInner: React.FC<Omit<FormProps, 'initialValues'>> = ({
  onSubmit,
  validationSchema = {},
  children,
  className = '',
  ...props
}) => {
  const { values, errors, touched, setErrors, setAllTouched } = useForm();

  const validateAllFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    Object.keys(validationSchema).forEach(key => {
      const validator = validationSchema[key];
      if (validator) {
        const error = validator(values[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateAllFields();
    setErrors(newErrors);
    
    const fields = Object.keys(validationSchema);
    setAllTouched(fields);
    
    if (Object.keys(newErrors).length === 0) {
      await onSubmit(values);
    }
  };

  return (
    <form className={`custom-form ${className}`} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  );
};

export const Form: React.FC<FormProps> = ({
  initialValues = {},
  children,
  ...props
}) => {
  return (
    <FormProvider initialValues={initialValues}>
      <FormInner {...props}>
        {children}
      </FormInner>
    </FormProvider>
  );
};

export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  children: React.ReactElement;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required,
  children,
}) => {
  const { values, errors, touched, setValue, setTouched } = useForm();
  const error = errors[name];
  const isTouched = touched[name];
  const value = values[name];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const newValue = e?.target?.value ?? e;
    setValue(name, newValue);
  };

  const handleBlur = () => {
    setTouched(name);
  };

  // Клонируем children с правильными props
  const enhancedChild = React.cloneElement(children, {
    value: value,
    onChange: handleChange,
    onBlur: handleBlur,
  } as React.Attributes & { value?: any; onChange?: any; onBlur?: any });

  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      {enhancedChild}
      {error && isTouched && <span className="form-error">{error}</span>}
    </div>
  );
};