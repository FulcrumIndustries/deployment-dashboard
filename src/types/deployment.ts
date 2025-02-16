
export type DeploymentCategory =
  | "Infrastructure"
  | "Software"
  | "Testing"
  | "Monitoring"
  | "Security"
  | "Backup"
  | "Process"
  | "Tools";

export interface DeploymentScript {
  name: string;
  command: string;
}

export interface DeploymentSection {
  prerequisites: DeploymentScript[];
  execution: DeploymentScript[];
  postDeployment: DeploymentScript[];
}

export interface Deployment {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: DeploymentCategory;
  sections: DeploymentSection;
}
