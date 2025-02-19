import type { DeploymentCategory, DeploymentStep, Prerequisite } from "../../shared/lib/db-setup";

export type { DeploymentCategory };

export interface Deployment {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: DeploymentCategory;
  sections?: {
    prerequisites: Prerequisite[];
    execution: DeploymentStep[];
    postDeployment: DeploymentStep[];
  };
}
