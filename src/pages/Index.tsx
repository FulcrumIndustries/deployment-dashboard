
import { useState } from "react";
import { DeploymentCard } from "@/components/DeploymentCard";
import type { Deployment } from "@/types/deployment";

const mockDeployments: Deployment[] = [
  {
    id: "1",
    title: "Production Database Migration",
    description: "Scheduled database migration with zero downtime deployment strategy",
    date: new Date("2024-04-15"),
    category: "Infrastructure",
    scripts: [
      {
        name: "Backup Database",
        command: "pg_dump -U postgres -d myapp > backup.sql",
      },
      {
        name: "Run Migration",
        command: "npm run migrate:latest",
      },
    ],
  },
  {
    id: "2",
    title: "Security Patch Deployment",
    description: "Critical security updates for web servers and application endpoints",
    date: new Date("2024-04-20"),
    category: "Security",
  },
  {
    id: "3",
    title: "Monitoring System Update",
    description: "Upgrade monitoring stack and implement new alert rules",
    date: new Date("2024-04-25"),
    category: "Monitoring",
  },
];

const Index = () => {
  const [deployments] = useState<Deployment[]>(mockDeployments);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Deployment Schedule</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage and track your deployment pipeline
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deployments.map((deployment) => (
          <DeploymentCard key={deployment.id} deployment={deployment} />
        ))}
      </div>
    </div>
  );
};

export default Index;
