export default class ExpressionError extends Error{
    constructor(...args){
        super(...args);
        Error.captureStackTrace(this, this.constructor.name);
    }
}