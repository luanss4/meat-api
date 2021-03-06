import { logger } from './../common/logger';
import * as restify from 'restify'
import * as mongoose from 'mongoose'
import {environment} from '../common/environment'
import {Router} from '../common/router'
import {mergePatchBodyParser} from './merge-patch.parser'
import {handleError} from './error.handler'
import { tokenParser } from '../security/token.parser';
import * as fs from 'fs'

export class Server {

  application: restify.Server

  initializeDb(): mongoose.MongooseThenable {
    (<any>mongoose).Promise = global.Promise
    return mongoose.connect(environment.db.url, {
      useMongoClient: true
    })
  }

  initRoutes(routers: Router[]): Promise<any>{
    return new Promise((resolve, reject)=>{
      try{
        const options: restify.ServerOptions ={
          name: 'meat-api',
          version: '1.0.0',
          log: logger,
          certificate: fs.readFileSync('./security/keys/cert.pem'),
          key: fs.readFileSync('./security/keys/key.pem')
        }
        this.application = restify.createServer(options)

        this.application.pre(restify.plugins.requestLogger({
          log: logger
        }))
        this.application.use(restify.plugins.queryParser())
        this.application.use(restify.plugins.bodyParser())
        this.application.use(mergePatchBodyParser)
        this.application.use(tokenParser)

        //routes
        for (let router of routers) {
          router.applyRoutes(this.application)
        }

        this.application.listen(environment.server.port, ()=>{
           resolve(this.application)
        })

        this.application.on('restifyError', handleError)
      //  this.application.on('after', restify.plugins.auditLogger({
      //    log: logger,
      //    event: 'after'
      //  }))

      }catch(error){
        reject(error)
      }
    })
  }

  bootstrap(routers: Router[] = []): Promise<Server>{
      return this.initializeDb().then(()=>
             this.initRoutes(routers).then(()=> this))
  }

}
