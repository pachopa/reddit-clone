import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/inputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({ }) => {
    const [complete, setComplete] = useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();

    return (
        <Wrapper variant="small">
            <Formik initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    // const response = await login(values);
                    // if (response.data?.login.errors) {
                    //     setErrors(toErrorMap(response.data.login.errors));
                    // } else if (response.data?.login.user) {
                    //     // worked
                    //     router.push('/');
                    // }
                    await forgotPassword(values);
                    setComplete(true);
                }}>
                {({ isSubmitting }) => complete ? <Box>if an account with that email exists, we sent you can email</Box> : (
                    <Form>
                        <InputField name='email' placeholder='email' label='Email' type='email' />
                        <Button mt={4} isLoading={isSubmitting} type="submit" colorScheme="teal">forgot password</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
