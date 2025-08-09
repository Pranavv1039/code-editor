const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path'); // ✅ Imported at the top

const ACTIONS = require('./src/Actions');
const { userSocketMap, userIdSet } = require('./userList');

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Optional: Adjust as needed for security
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// For all other routes, serve index.html (for React Router)
// Serve static files first
app.use(express.static(path.join(__dirname, 'build')));

// Anything else (that isn’t an API route) → index.html
app.get('*', (req, res) => {         //  <-- updated line
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Helper: Get all connected clients in a room
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
};

// Socket.IO connection
io.on('connection', (socket) => {
  // JOIN event
  socket.on(ACTIONS.JOIN, ({ roomId, username, id }) => {
    userSocketMap[socket.id] = username;
    userIdSet.add(id);
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Code change broadcast
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
      socketId: socket.id,
      code,
    });
  });

  // Code sync request
  socket.on(ACTIONS.SYNC_CODE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
      socketId: socket.id,
      code,
    });
  });

  // On disconnect
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

// ✅ Listen on 0.0.0.0 to allow EC2 access
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${port}`);
});
