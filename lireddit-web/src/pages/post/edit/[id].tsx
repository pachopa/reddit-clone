import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/inputField';
import { Layout } from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetIntId } from '../../../utils/useGetIntId';

const EditPost = ({ }) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    const [, updatePost] = useUpdatePostMutation();

    if (fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>
                    couldn't find post
                </Box>
            </Layout>
        );
    }


    return (
        <Layout variant='small'>
            <Formik initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values) => {
                    await updatePost({ id: intId, ...values });
                    // router.push("/");
                    router.back();
                }}>
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='title' placeholder='title' label='Title' />
                        <Box mt={4}>
                            <InputField textarea name='text' placeholder='text...' label='body' />
                        </Box>
                        <Button mt={4} isLoading={isSubmitting} type="submit" colorScheme="teal">update post</Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);