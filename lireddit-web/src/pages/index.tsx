import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../components/Layout";
// import { NavBar } from "../components/NavBar";
// import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link';
import { Button } from "@chakra-ui/button";
import { useState } from "react";
import { UpdootSection } from "../components/UpdootSection";
// import { isServer } from "../utils/isServer";
// import { isServer } from "../utils/isServer";
// import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";

const Index = () => {
    // console.log("################ index");
    const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string });

    // const [{ }] = useMeQuery({
    //     pause: isServer(),
    // });
    // console.log("me query first");

    const [{ data, error, fetching }] = usePostsQuery({
        variables,
        // pause: isServer(),
    });


    // console.log("post fetching", fetching, data);

    if (!fetching && !data) {
        return <div>you got query failed for some reason error: {error?.message}</div>;
    }

    return (
        <Layout>
            {/* <Flex align="center"> */}
            {/* <Heading>LiReddit</Heading> */}
            {/* <NextLink href="/create-post">
                    <Link ml="auto"> create post </Link>
                </NextLink> */}
            {/* </Flex> */}

            {!data && fetching
                ? <div>loading...</div>
                : (
                    <Stack spacing={8}>
                        {data!.posts.posts.map((p) =>
                            !p ? null : (
                                <Flex key={p.id} p={5} shadow="md" borderWidth="1px" >
                                    <UpdootSection post={p} />
                                    <Box flex={1}>
                                        <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                                            <Link >
                                                <Heading fontSize="xl">{p.title}</Heading>
                                            </Link>
                                        </NextLink>
                                        <Text>posted by {p.creator.username}</Text>
                                        <Flex align={"center"}>
                                            <Text mt={4}>{p.textSnippet}</Text>

                                            <Box ml="auto">
                                                <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                                            </Box>
                                        </Flex>
                                    </Box>
                                </Flex>))}
                    </Stack>
                )
            }
            {data && data.posts.hasMore
                ? (
                    <Flex>
                        <Button onClick={() => {
                            setVariables({
                                limit: variables.limit,
                                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                            });
                        }} isLoading={fetching} m="auto" my={8} style={{ background: '#1eb7ff', color: 'white' }}>
                            load more
                        </Button>
                    </Flex>
                )
                : null
            }
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
