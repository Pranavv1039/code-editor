const express=require('express')
const {Server}=require('socket.io')
const app=express()
const port=process.env.PORT || 5000
const http=require('http')
const ACTIONS = require('./src/Actions')
const server=http.createServer(app)

const io=new Server(server)

app.use(express.static('build'))

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'build/index.html'))
})

const {userSocketMap,userIdSet}=require('./userList')
const path = require('path')
const getAllConnectedClients=(roomId)=>{
return Array.from(io.sockets.adapter.rooms.get(roomId)|| []).map((socketId)=>{
    return {
        socketId,
        username:userSocketMap[socketId]
    }
})
}
io.on('connection',(socket)=>{
   
    socket.on(ACTIONS.JOIN,({roomId,username,id})=>{
        userSocketMap[socket.id]=username
        userIdSet.add(id)
        socket.join(roomId)
        const clients=getAllConnectedClients(roomId)
       // console.log({id,username,roomId})
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId:socket.id
            })
        })
    })
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        console.log({ roomId, code })
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            socketId: socket.id,
            code
        });
    });
    socket.on(ACTIONS.SYNC_CODE, ({ roomId, code }) => {
        console.log({ roomId, code })
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            socketId: socket.id,
            code
        });
    });
    socket.on('disconnecting',()=>{
        const rooms=[...socket.rooms]
        rooms.forEach(({roomId})=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId:socket.id,
                username:userSocketMap[socket.id]
            })
        })
        delete userSocketMap[socket.id]
        socket.leave()
    })
})


server.listen(port,()=>{
    console.log(`listening on ${port}`)
})
