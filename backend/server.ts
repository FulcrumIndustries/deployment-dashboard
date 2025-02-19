import { WebSocket, WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import { db } from '../src/lib/db-setup';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Map();
const deploymentStates = new Map();
const collaborators = new Map<string, { id: string; name: string; lastActive: Date }>();

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New connection from ${ip}`);

  const id = crypto.randomUUID();
  clients.set(id, ws);

  ws.on('message', async (rawData) => {
    const message = JSON.parse(rawData.toString());
    switch (message.type) {
      case 'SYNC_STATE':
        deploymentStates.set(message.deploymentId, message.data);
        broadcast({
          type: 'STATE_UPDATE',
          deploymentId: message.deploymentId,
          data: {
            deployment: message.data.deployment,
            steps: message.data.steps,
            prerequisites: message.data.prerequisites,
            info: message.data.info
          }
        }, id);
        break;

      case 'PRESENCE_UPDATE':
        collaborators.set(message.userId, {
          id: message.userId,
          name: message.userName,
          lastActive: new Date()
        });

        broadcast({
          type: 'PRESENCE',
          deploymentId: message.deploymentId,
          collaborators: Array.from(collaborators.values())
        }, id);
        break;

      case 'FULL_SYNC':
        // Clear existing related data
        await db.steps.where('deploymentId').equals(message.deploymentId).delete();
        await db.prerequisites.where('deploymentId').equals(message.deploymentId).delete();
        await db.info.where('deploymentId').equals(message.deploymentId).delete();

        // Add new data
        await db.steps.bulkAdd(message.data.steps);
        await db.prerequisites.bulkAdd(message.data.prerequisites);
        await db.info.bulkAdd(message.data.info);

        broadcast(message, id);
        break;

      case 'PARTIAL_SYNC':
        await db.transaction('rw', db.deployments, db.steps, db.prerequisites, db.info, () => {
          if (message.data.deployment) db.deployments.put(message.data.deployment);
          if (message.data.steps) db.steps.bulkPut(message.data.steps);
          if (message.data.prerequisites) db.prerequisites.bulkPut(message.data.prerequisites);
          if (message.data.info) db.info.bulkPut(message.data.info);
        });
        broadcast(message, id);
        break;

      case 'DELTA_SYNC':
        await db.transaction('rw', db.deployments, db.steps, db.prerequisites, db.info, () => {
          if (message.data.deployment) db.deployments.put(message.data.deployment);
          if (message.data.steps) db.steps.bulkPut(message.data.steps);
          if (message.data.prerequisites) db.prerequisites.bulkPut(message.data.prerequisites);
          if (message.data.info) db.info.bulkPut(message.data.info);
        });
        broadcast(message, id);
        break;
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log(`Connection closed from ${ip}`);
    clients.delete(id);
  });
});

function broadcast(message: object, senderId: string) {
  clients.forEach((client, id) => {
    if (id !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  });
}

server.listen(3001, '0.0.0.0', () => {
  console.log('WebSocket server running on port 3001');
}); 