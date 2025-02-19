import { db, type Deployment, type DeploymentStep } from '../../shared/lib/db-setup';

export class DeploymentService {
  async addDeployment(deployment: Omit<Deployment, 'id'>) {
    return db.addDeployment(deployment);
  }

  async getDeployment(id: number) {
    return db.deployments.get(id);
  }

  async getSteps(deploymentId: number) {
    return db.steps.where('deploymentId').equals(deploymentId).toArray();
  }
}

export const deploymentService = new DeploymentService(); 