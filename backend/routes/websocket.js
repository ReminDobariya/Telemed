const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const router = express.Router();

// Store active connections by appointment ID
const connections = new Map(); // appointmentId -> { doctor: ws, patient: ws }

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // Extract appointmentId from path like /ws/consultation/123
    const pathParts = url.pathname.split('/');
    const appointmentId = pathParts[pathParts.length - 1];
    const role = url.searchParams.get('role'); // 'doctor' or 'patient'

    // Validate path starts with /ws/consultation/
    if (!url.pathname.startsWith('/ws/consultation/') || !appointmentId || !role) {
      ws.close(1008, 'Invalid path or missing appointmentId/role');
      return;
    }

    console.log(`WebSocket connection: ${role} for appointment ${appointmentId}`);

    // Store connection
    if (!connections.has(appointmentId)) {
      connections.set(appointmentId, {});
    }
    const conns = connections.get(appointmentId);
    conns[role] = ws;

    // Notify both parties about connection status
    const otherRole = role === 'doctor' ? 'patient' : 'doctor';
    const otherWs = conns[otherRole];
    
    if (otherWs && otherWs.readyState === 1) {
      console.log(`Both parties connected for appointment ${appointmentId}`);
      // Notify the other party that this party has connected
      try {
        otherWs.send(JSON.stringify({
          type: 'peer-connected',
          role: role
        }));
      } catch (error) {
        console.error('Error sending connection notification:', error);
      }
      // Notify this party that the other party is already connected
      try {
        ws.send(JSON.stringify({
          type: 'peer-connected',
          role: otherRole
        }));
      } catch (error) {
        console.error('Error sending connection notification:', error);
      }
    } else {
      console.log(`Waiting for ${otherRole} to connect for appointment ${appointmentId}`);
    }

    // Forward messages between doctor and patient
    ws.on('message', (message) => {
      try {
        // Ensure message is a string/buffer, not a Blob
        let messageData = message;
        if (Buffer.isBuffer(message)) {
          messageData = message.toString('utf8');
        } else if (typeof message === 'string') {
          messageData = message;
        } else {
          messageData = message.toString();
        }

        // Validate it's valid JSON
        const data = JSON.parse(messageData);
        const otherRole = role === 'doctor' ? 'patient' : 'doctor';
        const otherWs = conns[otherRole];

        console.log(`Forwarding ${data.type} from ${role} to ${otherRole}`);

        if (otherWs && otherWs.readyState === 1) { // WebSocket.OPEN
          // Send as string to ensure it's not binary
          if (typeof messageData === 'string') {
            otherWs.send(messageData);
          } else {
            otherWs.send(JSON.stringify(data));
          }
        } else {
          console.log(`Other party (${otherRole}) not connected yet for appointment ${appointmentId}`);
          // Store message for later delivery (optional enhancement)
        }
      } catch (error) {
        console.error('Error forwarding WebSocket message:', error);
        console.error('Message was:', message.toString().substring(0, 100));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket disconnected: ${role} for appointment ${appointmentId}`);
      if (conns) {
        delete conns[role];
        if (!conns.doctor && !conns.patient) {
          connections.delete(appointmentId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${role} (${appointmentId}):`, error);
    });
  });

  return wss;
}

module.exports = { setupWebSocket, router };

