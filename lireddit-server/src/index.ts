import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core';
import { COOKIE_NAME, __prod__ } from './constants';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
// import { sendEmail } from "./utils/sendEmail";
// import { User } from "./entities/User";
// import { MyContext } from "./types";

const main = async () => {
    // sendEmail('bob@bob.com', "hello there");
    const orm = await MikroORM.init(microConfig);
    // await orm.em.nativeDelete(User, {});
    // await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis({
        password: `${process.env.REDIS_PASSWORD}`
    });
    // redis.auth(`${process.env.REDIS_PASSWORD}`);

    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ //cookie only works in https
            },
            secret: 'qwerwqerwqreqwr',
            resave: false,
            saveUninitialized: false
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res, redis })
    });

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });

    // await orm.isConnected();
    // const post = orm.em.create(Post, { title: 'my first post' });
    // await orm.em.persistAndFlush(post);
    console.log("------------sql 2 ---------------");
    // await orm.em.nativeInsert(Post, { title: 'my first post 2' });
    // const posts = await orm.em.find(Post, {});
    // console.log("posts", posts);
};

main().catch(err => {
    console.log("err", err);
});
