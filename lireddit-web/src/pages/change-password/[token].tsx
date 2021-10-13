import { Button } from '@chakra-ui/button';
import { Box, Flex, Link } from '@chakra-ui/layout';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/inputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';

interface Props {
    token: string;
}

const ChangePassword: NextPage<Props> = ({ token }) => {
    const [, changePassword] = useChangePasswordMutation();
    const router = useRouter();
    const [tokenError, setTokenError] = useState('');
    return (<Wrapper variant="small">
        <Formik initialValues={{ newPassword: '' }} onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({ newPassword: values.newPassword, token, });
            if (response.data?.changePassword.errors) {
                const errorMap = toErrorMap(response.data.changePassword.errors);
                if ('token' in errorMap) {
                    setTokenError(errorMap.token);
                }
                setErrors(errorMap);

            } else if (response.data?.changePassword.user) {
                // worked
                router.push('/');
            }
        }}>
            {({ isSubmitting }) => (
                <Form>
                    <InputField name='newPassword' placeholder='new password' label='New Password' type="password" />
                    {tokenError
                        ?
                        <Flex>
                            <Box mr={2} color='red'>{tokenError}</Box>
                            <NextLink href="/forgot-password">
                                <Link >click here to get new password</Link>
                            </NextLink>
                        </Flex>
                        :
                        null}
                    {/* <Box color='red'>{tokenError}</Box> */}
                    <Button mt={4} isLoading={isSubmitting} type="submit" colorScheme="teal">change password </Button>
                </Form>
            )}
        </Formik>
    </Wrapper>);
};

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string
    };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);