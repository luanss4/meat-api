import {Server} from './server/server'
const server = new Server()
import {usersRouter} from './users/users.router'

server.bootstrap([usersRouter]).then(server=>{
    console.log('API está rodando na porta ', server.application.address())
}).catch(error=>{
    console.log('Servidor falhou ao startar.')
    console.log(error)
    process.exit(2)
})
