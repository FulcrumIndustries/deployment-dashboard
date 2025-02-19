import { db } from '@/lib/db-setup';
import { websocketClient } from '@/lib/ws-client';

class SyncService {
  private ws: WebSocket | null = null;
  
  async initialize() {
    this.ws = await websocketClient();
    
    this.ws.onmessage = async (event) => {
      const { type, payload } = JSON.parse(event.data);
      
      switch(type) {
        case 'DEPLOYMENT_UPDATE':
          await db.deployments.put(payload);
          break;
          
        case 'STEP_UPDATE':
          await db.steps.put(payload);
          break;
      }
    };

    // Send local changes
    db.on('changes', changes => {
      changes.forEach(change => {
        this.ws?.send(JSON.stringify({
          type: 'LOCAL_UPDATE',
          payload: change
        }));
      });
    });
  }
}

export const syncService = new SyncService(); 