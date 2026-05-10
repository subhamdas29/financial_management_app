import {Response} from "express";

export const sendSuccess = ( // display success message to the user
    res: Response,
    data: any,
    message = 'Success',
    statusCode = 200
)=>{
    return res.status(statusCode).json({
        success:"true",
        message,
        data
    });
};

export const sendError = ( // display error message to the user
    res: Response,
    message = 'Something went wrong',
    statusCode = 500,
    errors: any[]= [] 
)=>{
    return res.status(statusCode).json({
        success:"false",
        message,
        errors
    });
};