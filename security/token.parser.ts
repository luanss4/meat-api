import { environment } from './../common/environment';
import { User } from './../users/users.model';
import * as restity from 'restify'
import * as jwt from 'jsonwebtoken'

export const tokenParser: restity.RequestHandler = (req, resp, next)=>{
    const token = extractToken(req)
    if(token){
        jwt.verify(token, environment.security.apiSecret, applyBearer(req, next))
    }else{
        next()
    }
}

function extractToken(req: restity.Request){
    //Authorization: Bearer TOKEN
    const authorization = req.header('authorization')
    let token = undefined;
    if(authorization){
        const parts: string[] = authorization.split(' ');
        if(parts.length === 2 && parts[0] === 'Bearer'){
            token = parts[1]
        }
    }
    return token
}

function applyBearer(req: restity.Request, next): (error, decoded)=> void {
    return (error, decoded)=>{
        if(decoded){
            User.findByEmail(decoded.sub).then(user=>{
                if(user){
                    //associar o usuario no request
                    req.authenticated = user
                }
                next()
            }).catch(next)
        }else{
            next()
        }
    }
}