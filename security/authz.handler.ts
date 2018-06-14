import * as restity from 'restify'
import { ForbiddenError } from 'restify-errors';

export const authorize: (...profiles: string[])=> restity.RequestHandler = (...profiles)=>{
    return (req, resp, next)=>{
        if(req.authenticated !== undefined && req.authenticated.hasAny(...profiles)){
            next()
        }else{
            next(new ForbiddenError('Permission denied'))
        }
    }
}