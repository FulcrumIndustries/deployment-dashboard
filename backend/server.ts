#!/usr/bin/env node

import express from 'express';
import type { Express } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { db } from '../shared/lib/db-setup';

const app: Express = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const port = 3001;

// WebSocket handling
wss.on('connection', (ws) => {
  const ipaddress = (ws as any)._socket.remoteAddress;
  console.log("Client " + ipaddress + " connected");

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      if (parsedMessage.type === 'PRESENCE_UPDATE') {
        const { deploymentId, userId, userName } = parsedMessage;
        await db.collaborators.put({
          id: userId,
          name: userName,
          deploymentId: deploymentId,
          lastActive: new Date(),
          lastSeen: new Date().getTime(),
        });

        const collaborators = await db.collaborators
          .where({ deploymentId })
          .toArray();

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'PRESENCE',
              collaborators
            }));
          }
        });
      }
    } catch (error) {
      // console.error('Failed to process message:', error);
    }
  });
});

// Serve static frontend files
const staticPath = path.join(process.cwd(), 'dist', 'assets');
const indexPath = path.join(process.cwd(), 'dist', 'index.html');

app.use(express.static(staticPath));

// Set proper MIME types
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

// Handle SPA fallback for all routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.includes('.')) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

server.listen(port, () => {
  console.log(`Combined server running on port ${port}`);
  console.log(`Use the following URLs to access the app:`);
  console.log(`   http://localhost:${port}`);
  // Log the IP address of the server
  const ipaddress = server.address();
  const actualipaddress = typeof ipaddress === 'string' ? ipaddress : ipaddress?.address;
  console.log(`   http://${actualipaddress}:${port}`);
  console.log(`Awaiting connections...`);
}); 