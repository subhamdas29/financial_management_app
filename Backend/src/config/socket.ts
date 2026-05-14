import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { JwtPayload } from '../shared/types';

let io: SocketServer;

export const initSocket = (httpServer: HttpServer): SocketServer =>{
    io = new SocketServer(httpServer,{
        cors:{ // to allow frontend
            origin:"*",
            methods: ["GET","POST"],
        },
    }); 

    io.use((socket: Socket,next)=>{ // to use the auth middleware for jwt verification
        const token = socket.handshake.auth.token;
        if(!token){return next(new Error("Authentication token missing"));}

        try{
            const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
            socket.data.user = payload;
            next();
        }catch{next(new Error("Invalid or expired token"));}

    });

    io.on('connection', (socket: Socket) => {
        const user = socket.data.user as JwtPayload;

    
        socket.join(`user:${user.userId}`); // private room
        console.log(`User ${user.userId} connected — socket ${socket.id}`);

        socket.on('disconnect', () => {
        console.log(`User ${user.userId} disconnected — socket ${socket.id}`);
        });
    });

    return io;
};


export const getIO = (): SocketServer => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};
