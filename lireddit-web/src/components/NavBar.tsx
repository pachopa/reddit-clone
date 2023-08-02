import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    console.log("################ navbar");
    const router = useRouter();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({ pause: isServer(), });
    // const [{ data, fetching }] = useMeQuery();

    // console.log('navbar data: ', data);
    let body = null;


    if (fetching) { // data is loading

    } else if (!data?.me) { // user not logged in
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link >register</Link>
                </NextLink>
            </>
        );
    } else { //user is logged in
        body = (
            <Flex alignItems={"center"}>
                <NextLink href="/create-post">
                    <Button as={Link} mr={4}>
                        create post
                        {/* <Link as={Button} mr={2}> </Link> */}
                    </Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button onClick={async () => {
                    await logout();
                    router.reload();
                }}
                    variant="link"
                    isLoading={logoutFetching}
                >logout</Button>
            </Flex>
        );
    }


    return (
        <Flex zIndex={1} position='sticky' top={0} bg="tan" p={4} >
            <Flex flex={1} m={"auto"} align={"center"} maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading>LiReddit</Heading>
                    </Link>
                </NextLink>
                <Box ml={'auto'} ali>
                    {body}
                </Box>
            </Flex>
        </Flex>
    );
};