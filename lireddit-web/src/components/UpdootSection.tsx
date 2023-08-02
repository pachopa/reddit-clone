import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<'updoot-loading' | 'downdoot-loading' | 'not-loading'>('not-loading');
    const [, vote] = useVoteMutation();

    // console.log(post);
    return (
        <Flex direction="column" justifyContent={"center"} alignItems={"center"} mr={4}>
            <IconButton
                aria-label="updoot post"
                size={'24px'}
                icon={<ChevronUpIcon />}
                onClick={async () => {
                    if (post.voteStatus === 1) {
                        return;
                    }
                    setLoadingState('updoot-loading');
                    await vote({
                        postId: post.id,
                        value: 1,
                    });
                    setLoadingState('not-loading');
                }}
                isLoading={loadingState === 'updoot-loading'}
                style={{ background: post.voteStatus === 1 ? 'green' : undefined }}
            />
            {post.points}

            <IconButton
                aria-label="downdoot post"
                size={'24px'}
                icon={<ChevronDownIcon />}
                onClick={async () => {
                    if (post.voteStatus === -1) {
                        return;
                    }
                    setLoadingState('downdoot-loading');
                    await vote({
                        postId: post.id,
                        value: -1,
                    });
                    setLoadingState('not-loading');
                }}
                isLoading={loadingState === 'downdoot-loading'}
                style={{ background: post.voteStatus === -1 ? 'tomato' : undefined }}

            />
            {/* <ChevronUpIcon onClick={() => console.log("yo")} w={6} h={6} />
        <ChevronDownIcon w={6} h={6} /> */}
        </Flex>
    );
};