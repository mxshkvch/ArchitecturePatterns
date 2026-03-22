// src/components/ui/Form/FormContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';

type FormState = {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
};

type FormAction =
  | { type: 'SET_VALUE'; name: string; value: any }
  | { type: 'SET_TOUCHED'; name: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'SET_ALL_TOUCHED'; fields: string[] };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.name]: action.value },
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.name]: true },
      };
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };
    case 'SET_ALL_TOUCHED':
      const allTouched = action.fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
      return {
        ...state,
        touched: { ...state.touched, ...allTouched },
      };
    default:
      return state;
  }
};

interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: any) => void;
  setTouched: (name: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  setAllTouched: (fields: string[]) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
};

interface FormProviderProps {
  initialValues?: Record<string, any>;
  children: React.ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ initialValues = {}, children }) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
  });

  const setValue = useCallback((name: string, value: any) => {
    dispatch({ type: 'SET_VALUE', name, value });
  }, []);

  const setTouched = useCallback((name: string) => {
    dispatch({ type: 'SET_TOUCHED', name });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const setAllTouched = useCallback((fields: string[]) => {
    dispatch({ type: 'SET_ALL_TOUCHED', fields });
  }, []);

  const value = {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    setValue,
    setTouched,
    setErrors,
    setAllTouched,
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};