import { Button } from '@chakra-ui/button';
import { Box } from '@chakra-ui/layout';
import { Formik, Form } from 'formik';
import React from 'react';
import { InputField } from '../components/inputField';
// import { Wrapper } from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({ }) => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout variant='small'>
            <Formik initialValues={{ title: '', text: '' }}
                onSubmit={async (values) => {
                    const { error } = await createPost({ input: values });
                    console.log(error, "new error");
                    if (!error) {
                        router.push('/');
                    }
                }}>
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='title' placeholder='title' label='Title' />
                        <Box mt={4}>
                            <InputField textarea name='text' placeholder='text...' label='body' />
                        </Box>
                        <Button mt={4} isLoading={isSubmitting} type="submit" colorScheme="teal">create post</Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);