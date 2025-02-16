
import { Calendar, Terminal, Server, Shield, Bug, Bell, History, Wrench } from "lucide-react";
import { format } from "date-fns";
import type { Deployment } from "@/types/deployment";

const categoryIcons = {
  Infrastructure: Server,
  Software: Terminal,
  Testing: Bug,
  Monitoring: Bell,
  Security: Shield,
  Backup: History,
  Process: Calendar,
  Tools: Wrench,
};

const categoryColors = {
  Infrastructure: "bg-blue-100 text-blue-800",
  Software: "bg-purple-100 text-purple-800",
  Testing: "bg-green-100 text-green-800",
  Monitoring: "bg-yellow-100 text-yellow-800",
  Security: "bg-red-100 text-red-800",
  Backup: "bg-indigo-100 text-indigo-800",
  Process: "bg-pink-100 text-pink-800",
  Tools: "bg-gray-100 text-gray-800",
};

interface DeploymentCardProps {
  deployment: Deployment;
}

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const Icon = categoryIcons[deployment.category];

  return (
    <div className="deployment-card animate-fade-up">
      <div className="flex items-start justify-between">
        <span className={`category-chip ${categoryColors[deployment.category]}`}>
          <Icon className="mr-1 h-3 w-3" />
          {deployment.category}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {format(deployment.date, "MMM d, yyyy")}
        </span>
      </div>
      <h3 className="card-title mt-2">{deployment.title}</h3>
      <p className="card-description mt-2">{deployment.description}</p>
      {deployment.scripts && deployment.scripts.length > 0 && (
        <div className="mt-4 space-y-2">
          {deployment.scripts.map((script, index) => (
            <div
              key={index}
              className="rounded-md bg-secondary p-2 text-sm font-mono"
            >
              <p className="text-xs text-muted-foreground">{script.name}</p>
              <code className="text-primary">{script.command}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
