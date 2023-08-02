import { Box, Heading } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';


const Post = ({ }) => {
    const [{ data, error, fetching }] = useGetPostFromUrl();


    if (fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (error) {
        return <div>{error.message}</div>;
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
        <Layout>
            <Heading mb={4}>
                <Box mb={4}>
                    {data.post.title}
                </Box>
            </Heading>
            {data.post.text}
            <EditDeletePostButtons id={data.post.id} creatorId={data.post.creator.id} />
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);