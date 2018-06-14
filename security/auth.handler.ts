import { environment } from './../common/environment';
import { User } from './../users/users.model';
import * as restity from 'restify'
import { NotAuthorizedError } from 'restify-errors';
import * as jwt from 'jsonwebtoken'

export const authenticate: restity.RequestHandler = (req, resp, next)=>{
    const {email, password} = req.body
    User.findByEmail(email, '+password').then(user=>{
        if(user && user.matches(password)){
            //Gera Token
            const token = jwt.sign({sub: user.email, iss: 'meat-api'}, 
                environment.security.apiSecret)
                resp.json({name: user.name, email: user.email, accessToken: token})
                return next(false)
        }else{
            return next(new NotAuthorizedError('Invalid Credentials'))
        }
    }).catch(next)
}