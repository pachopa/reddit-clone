import { User } from "../entities/User";

import { MyContext } from "src/types";
import { Arg, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import argon2 from 'argon2';
// import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
// import { validateRegister } from "src/utils/validateRegister";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from 'uuid';
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}


@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        console.log("######################## email resolver #######################");
        // this is the current user and its okay to show them their own email
        if (req.session.userId === user.id) {
            return user.email;
        }

        // current user wants to see someone elses email
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'length must be greater than 2'
                    }
                ]
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);

        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token expired'
                    }
                ]
            };
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user no longer exists'
                    }
                ]
            };
        }

        // user.password = await argon2.hash(newPassword);
        // await em.persistAndFlush(user);
        await User.update({ id: userIdNum }, {
            password: await argon2.hash(newPassword)
        });

        await redis.del(key);

        // log in user after change password
        req.session.userId = user.id;

        return { user };

    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // the email is not in the db
            return true;
        }

        const token = v4();

        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3); // 3days

        await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);

        return true;
    }

    @Query(() => User, { nullable: true })
    me(
        @Ctx() { req }: MyContext
    ) {
        console.log("######################## me resolver #######################", req.session);
        // console.log('session: ', req.session);
        // you are not logged in
        if (!req.session.userId) {
            return null;
        }

        return User.findOne(req.session.userId);
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }

        // console.log("this");
        const hashedPassword = await argon2.hash(options.password);
        // const user = em.create(User, { username: options.username, password: hashedPassword });
        let user;
        try {
            // User.create({}).save()
            const result = await getConnection().createQueryBuilder().insert().into(User).values({
                username: options.username,
                email: options.email,
                password: hashedPassword,
            }

            ).returning("*").execute();
            // console.log("result", result);
            user = result.raw[0];
        } catch (err) {
            console.log("err", err);
            // console.log("message" err);
            // duplicate username error
            if (err.code === '23505' || err.detail.includes("already exists")) {
                return {
                    errors: [{
                        field: 'username',
                        message: "username already taken"
                    }]
                };
            }
        }

        // store user id session
        // this will set a cookie on the user
        // keep them logged in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        // @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        // @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        // console.log("this test");
        const user = await User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } });
        // const user = await User.findOne()
        // console.log("this is login console");
        if (!user) {
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "that username doesn't exist"
                }]
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            };
        }

        req.session.userId = user.id;
        console.log("################ login mutation ####################", user.id, req.session);

        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }

            resolve(true);
        }));
    }
}