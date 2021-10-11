import { Box, Button, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching }] = useMeQuery({
        pause: isServer(),
    });

    console.log('data: ', data);
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
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button onClick={() => {
                    logout();
                }}
                    variant="link"
                    isLoading={logoutFetching}
                >logout</Button>
            </Flex>
        );
    }


    return (
        <Flex bg="tan" p={4} >
            <Box ml={'auto'}>
                {body}
            </Box>
        </Flex>
    );
};