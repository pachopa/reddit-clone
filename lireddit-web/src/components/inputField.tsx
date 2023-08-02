import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';
import { Textarea, TextareaProps } from '@chakra-ui/textarea';
import { useField } from 'formik';
import React from 'react';

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> &
    TextareaProps & {
        label: string;
        name: string;
        // placeholder?: string;
        textarea?: boolean;
    };


export const InputField: React.FC<InputFieldProps> = ({ label, textarea, size: _, ...props }) => {
    const [field, { error }] = useField(props);
    let InputOrTextArea = (
        <Input {...field} {...props} id={field.name} placeholder="text area" />
    );
    if (textarea) {
        InputOrTextArea = (
            <Textarea
                {...field}
                {...props}
                id={field.name}
                placeholder="text area"
            />
        );
    }

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            {InputOrTextArea}
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};