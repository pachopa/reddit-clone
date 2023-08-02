import { Request, Response } from 'express';
import { Session } from 'express-session';
import { Redis } from "ioredis";
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';


export type MyContext = {
    req: Request & { session: Session & { userId: number; }; };
    redis: Redis;
    res: MyResponse;
    userLoader: ReturnType<typeof createUserLoader>;
    updootLoader: ReturnType<typeof createUpdootLoader>;
};

// Define a custom type that extends the original Response type
type MyResponse = Response & {
    clearCookie: (name: string) => MyResponse; // Define the clearCookie method
};