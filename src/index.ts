import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import { BlockchainServer } from './blockchain-server'

const PORT = 3000;
const app = express();

const httpServer: http.Server = app.listen(PORT, ()=>console.log(`Server started at port: ${PORT}`))

const wsServer = new WebSocket.Server({server: httpServer});
new BlockchainServer(wsServer);