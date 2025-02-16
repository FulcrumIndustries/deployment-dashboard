import { useState } from "react";
import { Plus } from "lucide-react";
import { DeploymentCard } from "@/components/DeploymentCard";
import { DeploymentForm } from "@/components/DeploymentForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | undefined>();

  const handleCreate = (newDeployment: Partial<Deployment>) => {
    setDeployments((prev) => [...prev, newDeployment as Deployment]);
    setIsOpen(false);
  };

  const handleEdit = (updatedDeployment: Partial<Deployment>) => {
    setDeployments((prev) =>
      prev.map((dep) =>
        dep.id === updatedDeployment.id
          ? { ...dep, ...updatedDeployment }
          : dep
      )
    );
    setIsOpen(false);
    setEditingDeployment(undefined);
  };

  const handleDelete = (id: string) => {
    setDeployments((prev) => prev.filter((dep) => dep.id !== id));
  };

  const openEditSheet = (deployment: Deployment) => {
    setEditingDeployment(deployment);
    setIsOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight">Deployment Schedule</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage and track your deployment pipeline
          </p>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => setEditingDeployment(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deployment
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingDeployment ? "Edit" : "Create"} Deployment
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <DeploymentForm
                deployment={editingDeployment}
                onSubmit={editingDeployment ? handleEdit : handleCreate}
                onCancel={() => {
                  setIsOpen(false);
                  setEditingDeployment(undefined);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deployments.map((deployment) => (
          <DeploymentCard
            key={deployment.id}
            deployment={deployment}
            onEdit={() => openEditSheet(deployment)}
            onDelete={() => handleDelete(deployment.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
