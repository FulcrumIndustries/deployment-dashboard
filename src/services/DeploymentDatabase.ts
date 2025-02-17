import Dexie, { Table } from 'dexie';

export interface DeploymentStep {
  id: number;
  deploymentId: string;
  number: number;
  type: 'database' | 'scripting' | 'api' | 'files' | 'mail' | 'backup' | 'monitor' | 'configure' | 'prerequisite' | 'rollback';
  name: string;
  action: string;
  comment: string;
  isDone: boolean;
}

export interface Deployment {
  id: string;
  title?: string;
  description?: string;
  date?: Date;
  category?: string;
  createdAt: Date;
  steps: DeploymentStep[];
}

class DeploymentDatabase extends Dexie {
  deployments!: Table<Deployment>;
  steps!: Table<DeploymentStep>;

  constructor() {
    super('DeploymentDB');
    this.version(1).stores({
      deployments: 'id, createdAt',
      steps: '++id, deploymentId, number'
    });
  }
}

export const db = new DeploymentDatabase(); 