import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, IconButton, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number;
    creatorId: number;
}


export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
    id,
    creatorId
}) => {
    const [{ data: meData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();

    if (meData?.me?.id !== creatorId) {
        return null;
    }

    return (
        <Box>
            <NextLink href={"/post/edit/[id]"} as={`/post/edit/${id}`}>
                <IconButton as={Link} mr={4} ml={"auto"} icon={<EditIcon />} aria-label="Edit Post" />
            </NextLink>
            <IconButton ml={"auto"} icon={<DeleteIcon />} aria-label="Delete Post" onClick={() => {
                deletePost({ id });
            }} />
        </Box>
    );
};