export class ApiError extends Error{ //for displaying api error in a professional way
    constructor(
        public statusCode: number,
        public message: string,
        public errors: any[] = []
    ){
        super(message); //calling parent class to make exist the child constructor
        this.name="ApiError"; //error display will be ApiError: User not available
        Error.captureStackTrace(this,this.constructor); // this saves and record the path of the error
    }
}