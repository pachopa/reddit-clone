// import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

// m to n
// many to many
// user <--> posts
// user -> join table <- posts
// user -> updoot <-- posts

// @ObjectType()
@Entity()
export class Updoot extends BaseEntity {
    // @Field()
    @Column({ type: "int" })
    value: number;

    // @Field()
    @PrimaryColumn()
    userId: number;

    // @Field(() => User)
    @ManyToOne(() => User, user => user.updoots)
    user: User;

    // @Field()
    @PrimaryColumn()
    postId: number;

    // @Field(() => Post)
    @ManyToOne(() => Post, post => post.updoots)
    post: Post;

    // @ManyToOne(() => Post, (post) => post.updoots, {
    //     onDelete: "CASCADE"
    // })
}