import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../shared/utils/ApiError';
import { RegisterInput, LoginInput } from './auth.schema';
import { JwtPayload } from '../../shared/types';
import { email } from 'zod';

const generateTokens = (payload: JwtPayload)=>{ // This function generates the JWT tokens
    const accessToken = jwt.sign(payload, env.JWT_secret as string,{ // signs the userId and email so that it becomes unique and secure
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET as string,{
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as any, // expiresIn necessary to know the validity of the token
    });

    return {accessToken,refreshToken};
};

export const authService = {
    async register(input: RegisterInput){
        const existing = await prisma.user.findUnique({where: {email: input.email}});
    if (existing){
        throw new ApiError(409,"Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password,12); 
    // bcrypt will scramble the password 12 times, is we set it too low, hacker can find within seconds,
    //if high, the user will have to wait for much longer, 12 is the standard sweet spot for modern servers

    const user = await prisma.user.create({
        data:{
        name: input.name,
        email: input.email,
        passwordHash,
        },
        select:{ // if we dont write this, when returning user => passwordHash will also be returned
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    });
    
    const tokens = generateTokens({userId: user.id, email: user.email});
    return {user, ...tokens}; 
    },

    async login(input : LoginInput){
        const user = await prisma.user.findUnique({
            where: {email:input.email}
        });

        const dummyHash = '$2b$12$dummyhashfordummycomparison00000000000000000';
        // this is to prevent time attacks, if email is not in our db, we can send an error quickly but if it is in out db, it will take slightly longer time
        // hackers might use this delay to scan thousands of emails and see which email is taking longer time, and that email is in our db
        // so this dummy hash is used to verify this false hash is used even if user email is not in our db to take same time for all type of emails


        const passwordMatch = await bcrypt.compare( 
            input.password,
            user?.passwordHash ?? dummyHash //if user exists, check passwordHash or dummyHash if not
        );

        if(!user || !passwordMatch){throw new ApiError(401, "Invalid credentials")};

        const tokens = generateTokens({ userId: user.id, email: user.email });

        return {
            user:{
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            ...tokens,
        };
    },

    async refreshToken(token: string){
        try{
        const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
        const user = await prisma.user.findUnique({
            where:{ id : payload.userId},
            select:{ id:true, email: true},
        });

        if (!user){throw new ApiError(401, "User not found")};

        const tokens = generateTokens({userId: user.id, email: user.email});
        return tokens;
        }catch(error){
            throw new ApiError(401, 'Invalid or expired refresh token');
        };
    },


};