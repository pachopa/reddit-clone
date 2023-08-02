import DataLoader from "dataloader";
import { User } from "../entities/User";

// [1, 78, 8, 9]

export const createUserLoader = () => new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach(u => {
        userIdToUser[u.id] = u;
    });
    console.log("######################## createCreatorLoader #######################", userIds, users, userIdToUser);

    return userIds.map(userId => userIdToUser[userId]);

});