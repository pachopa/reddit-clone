import { Cache, cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { pipe, tap } from 'wonka';
import { DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from 'next/router';
import gql from 'graphql-tag';
import { isServer } from './isServer';


export const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes('not authenticated')) {
                // REPACE is better when we redirect to a speicifc page rater than PUSH
                Router.replace("/login");
            }
        })
    );
};

const cursorPagination = (): Resolver => {

    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        // console.log(entityKey, fieldName);
        const allFields = cache.inspectFields(entityKey);
        // console.log("allFields", allFields);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        // console.log("fieldArgs:", fieldArgs);
        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(cache.resolve(entityKey, fieldKey) as string, 'posts');
        // console.log('key we created: ',);
        // console.log("isItInTheCache:", isItInTheCache);
        info.partial = !isItInTheCache;

        let hasMore = true;
        const results: string[] = [];
        fieldInfos.forEach(fi => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, 'posts') as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            // console.log("data: ", data, hasMore);
            results.push(...data);
        });

        // console.log(hasMore, results);

        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results
        };


        // cache.readQuery()

        //   const visited = new Set();
        //   let result: NullArray<string> = [];
        //   let prevOffset: number | null = null;

        //   for (let i = 0; i < size; i++) {
        //     const { fieldKey, arguments: args } = fieldInfos[i];
        //     if (args === null || !compareArgs(fieldArgs, args)) {
        //       continue;
        //     }

        //     const links = cache.resolve(entityKey, fieldKey) as string[];
        //     const currentOffset = args[cursorArgument];

        //     if (
        //       links === null ||
        //       links.length === 0 ||
        //       typeof currentOffset !== 'number'
        //     ) {
        //       continue;
        //     }

        //     const tempResult: NullArray<string> = [];

        //     for (let j = 0; j < links.length; j++) {
        //       const link = links[j];
        //       if (visited.has(link)) continue;
        //       tempResult.push(link);
        //       visited.add(link);
        //     }

        //     if (
        //       (!prevOffset || currentOffset > prevOffset) ===
        //       (mergeMode === 'after')
        //     ) {
        //       result = [...result, ...tempResult];
        //     } else {
        //       result = [...tempResult, ...result];
        //     }

        //     prevOffset = currentOffset;
        //   }

        //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        //   if (hasCurrentPage) {
        //     return result;
        //   } else if (!(info as any).store.schema) {
        //     return undefined;
        //   } else {
        //     info.partial = true;
        //     return result;
        //   }
    };
};

const invalidateAllPosts = (cache: Cache) => {
    const allFields = cache.inspectFields('Query');
    const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
    // console.log("cache:", cache, allFields, fieldInfos);
    fieldInfos.forEach((fi) => {
        cache.invalidate('Query', 'posts', fi.arguments || {});
    });
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    console.log("isServer():", isServer());
    let cookie = '';
    if (isServer()) {
        // console.log("ctx:", );
        cookie = ctx?.req?.headers?.cookie;
    }

    return ({
        url: 'http://localhost:4000/graphql',
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? {
                cookie
            } : undefined
        },
        exchanges: [dedupExchange, cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                }
            },
            updates: {
                Mutation: {
                    deletePost: (_result, args, cache, __) => {
                        cache.invalidate({ __typename: 'Post', id: (args as DeletePostMutationVariables).id });
                    },
                    vote: (_result, args, cache, __) => {
                        const { postId, value } = args as VoteMutationVariables;
                        const data = cache.readFragment(
                            gql`
                            fragment _ on Post {
                                id
                                points
                                voteStatus
                            }
                        `,
                            { id: postId } as any
                        );
                        // console.log("data: ", data);
                        if (data) {
                            if (data.voteStatus === value) {
                                return;
                            }
                            const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);

                            cache.writeFragment(
                                gql`
                                fragment __ on Post {
                                    points
                                    voteStatus
                                }
                            `,
                                { id: postId, points: newPoints, voteStatus: value } as any
                            );
                        }

                    },
                    createPost: (_result, _, cache, __) => {
                        invalidateAllPosts(cache);
                        // console.log(cache.inspectFields("Query"));
                        // console.log(cache.inspectFields("Query"));
                    },
                    logout: (_result, _, cache, __) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument },
                            _result, () => ({ me: null })
                        );
                    },
                    login: (_result, _, cache, __) => {
                        // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
                        // });
                        betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument },
                            _result, (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.login.user,
                                    };
                                }
                            });
                        invalidateAllPosts(cache);
                    },

                    register: (_result, _, cache, __) => {
                        // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
                        // });
                        betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument },
                            _result, (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.register.user,
                                    };
                                }
                            });
                    }
                }
            }
        }), errorExchange, ssrExchange, fetchExchange]
    });
};
