import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import theme from '../theme';

// const client = createClient({
//     url: 'http://localhost:4000/graphql',
//     fetchOptions: {
//         credentials: "include",
//     },
//     exchanges: [dedupExchange, cacheExchange({
//         updates: {
//             Mutation: {
//                 logout: (_result, args, cache, info) => {
//                     betterUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument },
//                         _result, () => ({ me: null })
//                     );
//                 },
//                 login: (_result, args, cache, info) => {
//                     // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
//                     // });
//                     betterUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument },
//                         _result, (result, query) => {
//                             if (result.login.errors) {
//                                 return query;
//                             } else {
//                                 return {
//                                     me: result.login.user,
//                                 };
//                             }
//                         });
//                 },

//                 register: (_result, args, cache, info) => {
//                     // cache.updateQuery({ query: MeDocument }, (data: MeQuery) => {
//                     // });
//                     betterUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument },
//                         _result, (result, query) => {
//                             if (result.register.errors) {
//                                 return query;
//                             } else {
//                                 return {
//                                     me: result.register.user,
//                                 };
//                             }
//                         });
//                 }
//             }
//         }
//     }), fetchExchange]
// });


function MyApp({ Component, pageProps }: any) {
    return (
        // <Provider value={client}>

        <ChakraProvider resetCSS theme={theme}>
            <ColorModeProvider
                options={{
                    useSystemColorMode: true,
                }}
            >
                <Component {...pageProps} />
            </ColorModeProvider>
        </ChakraProvider>
        // </Provider>

    );
}

export default MyApp;
