import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { DeploymentCard } from "@/components/DeploymentCard";
import { DeploymentForm } from "@/components/DeploymentForm";
import { Button as MuiButton } from "@mui/material";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  db,
  type Deployment,
  type DeploymentStep,
  type DeploymentInfo,
  type Prerequisite,
} from "../lib/db-setup";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import PythonIcon from "@mui/icons-material/Code";
import EmailIcon from "@mui/icons-material/Email";
import FolderIcon from "@mui/icons-material/Folder";
import { v4 as uuidv4 } from "uuid";
import { WavesBackground } from "@/components/WavesBackground";
import { useNavigate, useParams } from "react-router-dom";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
import ApiIcon from "@mui/icons-material/Api";
import MonitorIcon from "@mui/icons-material/Monitor";
import TuneIcon from "@mui/icons-material/Tune";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSnackbar } from "notistack";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { debug } from "../utils/debug";
import PresenceIndicator from "@/components/PresenceIndicator";
import { setupRealtime } from "../lib/db-setup";
import { useObservable } from "dexie-react-hooks";
import { liveQuery } from "dexie";

interface Step {
  id: number;
  deploymentId: number;
  datetime: Date;
  type: string;
  name: string;
  action: string;
  actor: string;
  isDone: boolean;
}

const getIconForType = (type: string) => {
  switch (type) {
    case "database":
      return <StorageIcon />;
    case "scripting":
      return <CodeIcon />;
    case "api":
      return <ApiIcon />;
    case "files":
      return <FolderIcon />;
    case "mail":
      return <EmailIcon />;
    case "backup":
      return <BackupIcon />;
    case "monitor":
      return <MonitorIcon />;
    case "configure":
      return <TuneIcon />;
    case "rollback":
      return <RestoreIcon />;
    default:
      return null;
  }
};

const typeOptions = [
  {
    value: "database",
    label: "Database",
    color: "#0891b2", // Cyan
    icon: <StorageIcon />,
  },
  {
    value: "scripting",
    label: "Scripting",
    color: "#059669", // Emerald
    icon: <CodeIcon />,
  },
  {
    value: "api",
    label: "API",
    color: "#6366f1", // Indigo
    icon: <ApiIcon />,
  },
  {
    value: "files",
    label: "Files",
    color: "#f59e0b", // Amber
    icon: <FolderIcon />,
  },
  {
    value: "mail",
    label: "Mail",
    color: "#dc2626", // Red
    icon: <EmailIcon />,
  },
  {
    value: "backup",
    label: "Backup",
    color: "#2563eb", // Blue
    icon: <BackupIcon />,
  },
  {
    value: "monitor",
    label: "Monitor",
    color: "#7c3aed", // Violet
    icon: <MonitorIcon />,
  },
  {
    value: "configure",
    label: "Configure",
    color: "#16a34a", // Green
    icon: <TuneIcon />,
  },
  {
    value: "rollback",
    label: "Rollback",
    color: "#be123c", // Rose
    icon: <RestoreIcon />,
  },
  {
    value: "service",
    label: "Service",
    color: "#0d9488", // Teal
    icon: <MiscellaneousServicesIcon />,
  },
  {
    value: "network",
    label: "Network",
    color: "#0369a1", // Sky Blue
    icon: <SettingsEthernetIcon />,
  },
];

const AnimatedContainer = styled(Container)`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Index = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<
    Deployment | undefined
  >();
  const [mode, setMode] = useState<"choice" | "new" | "existing">("choice");
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [storedDeployments, setStoredDeployments] = useState<Deployment[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deploymentIdInput, setDeploymentIdInput] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState<string | null>(
    null
  );
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );

  // First, add a ref to measure the viewport height
  const viewportRef = useRef<HTMLDivElement>(null);

  // Add useEffect to handle dynamic height
  useEffect(() => {
    const updateMaxHeight = () => {
      if (viewportRef.current) {
        const vh = window.innerHeight;
        const maxTableHeight = Math.floor(vh * 0.8); // 80% of viewport height
        viewportRef.current.style.maxHeight = `${maxTableHeight}px`;
      }
    };

    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, []);

  React.useEffect(() => {
    const loadDeployment = async () => {
      if (id) {
        try {
          const deployment = await db.getDeployment(id);
          if (!deployment) {
            navigate("/");
            enqueueSnackbar("Deployment not found", { variant: "error" });
            return;
          }

          // Set the deploymentId from URL parameter
          setDeploymentId(id);

          const [steps, prerequisites, info] = await Promise.all([
            db.steps.where("deploymentId").equals(id).toArray(),
            db.prerequisites.where("deploymentId").equals(id).toArray(),
            db.info.where("deploymentId").equals(id).toArray(),
          ]);
        } catch (error) {
          console.error("Error loading deployment:", error);
          navigate("/");
          enqueueSnackbar("Error loading deployment", { variant: "error" });
        }
      }
    };

    loadDeployment();
  }, [id, navigate]);

  const loadDeployments = async () => {
    const deployments = await db.deployments.toArray();
    setDeployments(deployments);
  };

  const handleCreate = (newDeployment: Partial<Deployment>) => {
    setDeployments((prev) => [...prev, newDeployment as Deployment]);
    setIsOpen(false);
  };

  const handleEdit = (updatedDeployment: Partial<Deployment>) => {
    setDeployments((prev) =>
      prev.map((dep) =>
        dep.id === updatedDeployment.id ? { ...dep, ...updatedDeployment } : dep
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

  const handleTitleChange = async (newTitle: string) => {
    try {
      if (!deploymentId) return;

      // Update local state first for immediate feedback
      setCurrentDeployment((prev) =>
        prev ? { ...prev, title: newTitle } : null
      );

      // Update database
      await db.deployments.update(deploymentId, { title: newTitle });

      // Broadcast change via WebSocket
      const ws = new WebSocket(
        `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
          window.location.host
        }/ws`
      );
      ws.onopen = async () => {
        const deployment = await db.deployments.get(deploymentId);
        if (!deployment) return;

        ws.send(
          JSON.stringify({
            type: "SYNC_STATE",
            deploymentId,
            data: {
              deployment,
              steps: await db.steps.where({ deploymentId }).toArray(),
              prerequisites: await db.prerequisites
                .where({ deploymentId })
                .toArray(),
              info: await db.info.where({ deploymentId }).toArray(),
            },
          })
        );
      };
    } catch (error) {
      console.error("Error updating title:", error);
      enqueueSnackbar("Error updating title", { variant: "error" });
    }
  };

  const handleNewDeployment = async () => {
    try {
      const newDeployment = {
        id: uuidv4(),
        title: "New Deployment",
        description: "",
        date: new Date(),
        category: "General",
        createdAt: new Date(),
        modifiedAt: new Date(),
        version: 1,
        deleted: false,
      };

      const id = await db.addDeployment(newDeployment);
      const created = await db.getDeployment(id);
      if (created) {
        navigate(`/deployment/${created.id}`);
        enqueueSnackbar("Deployment created successfully", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error creating deployment:", error);
      enqueueSnackbar("Error creating deployment", { variant: "error" });
    }
  };

  const handleExistingDeployment = async () => {
    if (!deploymentId) return;

    try {
      const deployment = await db.getDeployment(deploymentId);
      if (!deployment) {
        enqueueSnackbar("Deployment not found", {
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
        });
        return;
      }
      navigate(`/deployment/${deploymentId}`);
    } catch (error) {
      console.error("Error loading deployment:", error);
      enqueueSnackbar("Error loading deployment", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
  };

  const handleAddStep = async () => {
    if (!deploymentId) {
      enqueueSnackbar("No deployment selected", { variant: "warning" });
      return;
    }

    try {
      await db.addStep({
        deploymentId,
        type: "database",
        name: "New Step",
        action: "",
        actor: "",
        isDone: false,
        number: steps.length + 1,
        datetime: new Date(),
        version: 1,
      });
    } catch (error) {
      console.error("Error adding step:", error);
      enqueueSnackbar("Error adding step", { variant: "error" });
    }
  };

  const updateStep = async (id: string, changes: Partial<DeploymentStep>) => {
    try {
      await db.steps.update(id, changes);
    } catch (error) {
      console.error("Error updating step:", error);
      enqueueSnackbar("Error updating step", { variant: "error" });
    }
  };

  const deleteStep = async (id: string) => {
    try {
      await db.deleteStep(id);
    } catch (error) {
      console.error("Error deleting step:", error);
      enqueueSnackbar("Error deleting step", { variant: "error" });
    }
  };

  const handleLoadDeployment = async () => {
    const id = deploymentIdInput.trim();
    if (!id) {
      enqueueSnackbar("Please enter a deployment ID", { variant: "warning" });
      return;
    }

    try {
      const deployment = await db.getDeployment(id);
      if (!deployment) {
        enqueueSnackbar("Deployment not found", { variant: "error" });
        return;
      }

      const steps = await db.steps.where("deploymentId").equals(id).toArray();
      const prerequisites = await db.prerequisites
        .where("deploymentId")
        .equals(id)
        .toArray();
      const info = await db.info.where("deploymentId").equals(id).toArray();

      navigate(`/deployment/${deployment.id}`);
    } catch (error) {
      console.error("Error loading deployment:", error);
      enqueueSnackbar("Error loading deployment", { variant: "error" });
    }
  };

  const handleDeleteDeployment = async (deploymentId: string) => {
    try {
      await db.deleteDeployment(deploymentId);
      setStoredDeployments((prev) => prev.filter((d) => d.id !== deploymentId));
      enqueueSnackbar("Deployment deleted successfully", {
        variant: "success",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting deployment:", error);
      enqueueSnackbar("Error deleting deployment", { variant: "error" });
    }
    setConfirmingDeleteId(null);
  };

  const handleAddInfo = async () => {
    if (!deploymentId) return;

    try {
      await db.addInfo({
        deploymentId,
        information: "New Information",
        version: 1,
        modifiedAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding info:", error);
      enqueueSnackbar("Error adding info", { variant: "error" });
    }
  };

  const handleAddPrerequisite = async () => {
    if (!deploymentId) return;

    try {
      await db.addPrerequisite({
        deploymentId,
        type: "general",
        name: "New Prerequisite",
        action: "",
        actor: "",
        isDone: false,
        number: prerequisites.length + 1,
        version: 1,
        modifiedAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding prerequisite:", error);
      enqueueSnackbar("Error adding prerequisite", { variant: "error" });
    }
  };

  const updatePrerequisite = async (
    id: string,
    changes: Partial<Prerequisite>
  ) => {
    try {
      await db.prerequisites.update(id, {
        ...changes,
        modifiedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating prerequisite:", error);
      enqueueSnackbar("Error updating prerequisite", { variant: "error" });
    }
  };

  const deletePrerequisite = async (id: string) => {
    try {
      await db.deletePrerequisite(id);
    } catch (error) {
      console.error("Error deleting prerequisite:", error);
      enqueueSnackbar("Error deleting prerequisite", { variant: "error" });
    }
  };

  const handleAddDeployment = async (deployment: Deployment) => {
    try {
      await db.addDeployment(deployment);
      setStoredDeployments([...storedDeployments, deployment]);
      setDeploymentId(deployment.id);
      navigate(`/deployment/${deployment.id}`);
      enqueueSnackbar("Deployment created successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    } catch (error) {
      console.error("Error adding deployment:", error);
      enqueueSnackbar("Error creating deployment", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
  };

  // Update ID conversions
  const idParam = id ? Number(id) : null;
  const deploymentIdNum = deploymentId ? Number(deploymentId) : null;

  // Add this useEffect to load all entities
  useEffect(() => {
    const loadAll = async () => {
      if (deploymentId) {
        const [steps, prerequisites, info] = await Promise.all([
          db.steps.where({ deploymentId }).toArray(),
          db.prerequisites.where({ deploymentId }).toArray(),
          db.info.where({ deploymentId }).toArray(),
        ]);
      }
    };
    loadAll();
  }, [deploymentId]);

  // Add this useEffect near other useEffect hooks
  useEffect(() => {
    const loadInitialDeployments = async () => {
      try {
        const deployments = await db.deployments.toArray();
        setStoredDeployments(deployments);
      } catch (error) {
        console.error("Error loading deployments:", error);
        enqueueSnackbar("Error loading deployments", { variant: "error" });
      }
    };

    if (!id) {
      loadInitialDeployments();
    }
  }, [id]);

  // Update the copy ID handler
  const handleCopyId = () => {
    if (!deploymentId) return;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(deploymentId)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((error) => {
          console.error("Failed to copy:", error);
          enqueueSnackbar("Failed to copy ID", { variant: "error" });
        });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = deploymentId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  useEffect(() => {
    if (!deploymentId) return;
    const cleanup = setupRealtime(deploymentId);
    return () => cleanup();
  }, [deploymentId]);

  // Replace direct queries with liveQuery wrappers
  const steps =
    useObservable(() =>
      deploymentId
        ? liveQuery(() =>
            db.steps.where("deploymentId").equals(deploymentId).sortBy("number")
          )
        : liveQuery(() => [])
    ) ?? [];

  const prerequisites =
    useObservable(() =>
      deploymentId
        ? liveQuery(() =>
            db.prerequisites
              .where("deploymentId")
              .equals(deploymentId)
              .sortBy("number")
          )
        : liveQuery(() => [])
    ) ?? [];

  const deploymentInfo =
    useObservable(() =>
      deploymentId
        ? liveQuery(() =>
            db.info.where("deploymentId").equals(deploymentId).toArray()
          )
        : liveQuery(() => [])
    ) ?? [];

  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(
    null
  );

  useEffect(() => {
    const loadCurrentDeployment = async () => {
      if (deploymentId) {
        const deployment = await db.deployments.get(deploymentId);
        setCurrentDeployment(deployment || null);
      }
    };
    loadCurrentDeployment();
  }, [deploymentId]);

  // Change from Dexie's subscribe to liveQuery
  useEffect(() => {
    if (!deploymentId) return;

    const subscription = liveQuery(() =>
      db.deployments.where("id").equals(deploymentId).toArray()
    ).subscribe((results) => {
      setCurrentDeployment(results[0] || null);
    });

    return () => subscription.unsubscribe();
  }, [deploymentId]);

  if (!id) {
    return (
      <>
        <WavesBackground />
        <AnimatedContainer
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            py: 8,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                animation: "slideDown 0.5s ease-out",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: "#fff",
                  fontWeight: "800",
                  mb: 2,
                  textShadow: "0 0 20px rgba(79, 70, 229, 0.5)",
                  fontFamily:
                    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
                }}
              >
                Ai<span style={{ color: "rgb(79, 70, 229)" }}>onyx</span>{" "}
                EasyDeploy
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#64748b",
                  maxWidth: "600px",
                  mx: "auto",
                }}
              >
                Manage your deployments with ease and track their progress
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                width: "100%",
                animation: "fadeIn 0.5s ease-out 0.2s both",
              }}
            >
              {/* Left side: Existing Deployments */}
              <Box
                sx={{
                  background: "rgba(23, 25, 35, 0.9)", // Darker, more theme-fitting background
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  p: 4,
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <FolderIcon /> Existing Deployments
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: "400px",
                    overflowY: "auto",
                    pr: 2,
                    "&::-webkit-scrollbar": {
                      width: "8px",
                      background: "rgba(255, 255, 255, 0.05)",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0,0,0,0.05)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "4px",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.3)",
                      },
                    },
                  }}
                >
                  {storedDeployments.map((deployment) => (
                    <Paper
                      key={deployment.id}
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 1)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => navigate(`/deployment/${deployment.id}`)}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {deployment.title || "Untitled Deployment"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          ID: {deployment.id}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Created:{" "}
                          {new Date(deployment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {confirmingDeleteId === deployment.id ? (
                          <>
                            <MuiButton
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteId(null);
                              }}
                              sx={{
                                bgcolor: "#3b82f6",
                                "&:hover": { bgcolor: "#2563eb" },
                              }}
                            >
                              Cancel
                            </MuiButton>
                            <MuiButton
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDeployment(deployment.id);
                                setConfirmingDeleteId(null);
                              }}
                              sx={{
                                bgcolor: "#ef4444",
                                "&:hover": { bgcolor: "#dc2626" },
                              }}
                            >
                              Confirm Delete
                            </MuiButton>
                          </>
                        ) : (
                          <>
                            <MuiButton
                              variant="outlined"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/deployment/${deployment.id}`);
                              }}
                            >
                              Open
                            </MuiButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteId(deployment.id);
                              }}
                              sx={{
                                color: "#ef4444",
                                "&:hover": {
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Paper>
                  ))}
                  {storedDeployments.length === 0 && (
                    <Typography
                      variant="body1"
                      sx={{ textAlign: "center", color: "#64748b" }}
                    >
                      No deployments yet
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Right side: New Deployment & Load Existing */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <Box
                  sx={{
                    background: "#0a0a0f",
                    backdropFilter: "none",
                    borderRadius: "16px",
                    p: 4,
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <AddIcon /> New Deployment
                  </Typography>
                  <MuiButton
                    variant="contained"
                    size="large"
                    onClick={handleNewDeployment}
                    sx={{
                      width: "100%",
                      py: 3,
                      background:
                        "linear-gradient(45deg, #4f46e5 30%, #2563eb 90%)",
                      color: "white",
                      boxShadow: "0 0 20px rgba(79, 70, 229, 0.5)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 0 30px rgba(79, 70, 229, 0.8)",
                        background:
                          "linear-gradient(45deg, #4338ca 30%, #1d4ed8 90%)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Create New Deployment
                  </MuiButton>
                </Box>

                <Box
                  sx={{
                    background: "#0a0a0f",
                    backdropFilter: "none",
                    borderRadius: "16px",
                    p: 4,
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <SearchIcon /> Load Existing
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter Deployment ID"
                      value={deploymentIdInput}
                      onChange={(e) => setDeploymentIdInput(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                        },
                      }}
                    />
                    <MuiButton
                      variant="contained"
                      onClick={handleLoadDeployment}
                      sx={{
                        minWidth: "100px",
                        background:
                          "linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)",
                        boxShadow: "0 0 20px rgba(79, 70, 229, 0.5)",
                        color: "white",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #4338ca 30%, #6d28d9 90%)",
                          boxShadow: "0 0 30px rgba(79, 70, 229, 0.8)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Load
                    </MuiButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </AnimatedContainer>
      </>
    );
  }

  return (
    <>
      <WavesBackground />
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          pt: 4,
          pb: 2,
          animation: "fadeIn 0.5s ease-out",
        }}
        ref={viewportRef}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0, // Important for flex child scrolling
          }}
        >
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                position: "absolute",
                top: 24,
                left: 24,
              }}
            >
              <MuiButton
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{
                  color: "#64748b",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              >
                Back to Dashboard
              </MuiButton>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mb: 6,
              }}
            >
              <TextField
                placeholder="Deployment Name"
                value={currentDeployment?.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                sx={{
                  width: "50%",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    fontSize: "1.5rem",
                    textAlign: "center",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-2px)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-2px)",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#1e293b",
                  },
                  transition: "all 0.2s ease",
                }}
                inputProps={{
                  style: { textAlign: "center" },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(45deg, transparent 0%, rgba(79, 70, 229, 0.2) 50%, transparent 100%)",
                    transform: copySuccess
                      ? "translateX(100%)"
                      : "translateX(-100%)",
                    transition: "transform 0.6s ease",
                  },
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  ID: {deploymentId}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleCopyId}
                  sx={{
                    padding: "4px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {copySuccess ? (
                    <CheckCircleIcon
                      sx={{
                        fontSize: "1rem",
                        color: "#10b981",
                        animation: "popIn 0.3s ease-out",
                      }}
                    />
                  ) : (
                    <ContentCopyIcon
                      sx={{
                        fontSize: "1rem",
                        color: "#64748b",
                      }}
                    />
                  )}
                </IconButton>
              </Box>
              <Snackbar
                open={copySuccess}
                autoHideDuration={2000}
                onClose={() => setCopySuccess(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              >
                <Alert
                  severity="success"
                  sx={{
                    backgroundColor: "rgba(16, 185, 129, 0.9)",
                    color: "white",
                    "& .MuiAlert-icon": {
                      color: "white",
                    },
                  }}
                >
                  Deployment ID copied to clipboard!
                </Alert>
              </Snackbar>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1e293b" }}>
                Related Information
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  mb: 4,
                  "& .MuiTableCell-head": {
                    color: "#1e293b",
                    borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
                    background: "rgba(255, 255, 255, 0.98)",
                    fontWeight: 600,
                  },
                  "& .MuiTableCell-body": {
                    color: "#334155",
                    borderColor: "rgba(0, 0, 0, 0.06)",
                  },
                  "& .MuiTextField-root": {
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      color: "#334155",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(0, 0, 0, 0.03)",
                      },
                    },
                  },
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Information</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deploymentInfo.map((info, index) => (
                      <TableRow key={info.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={info.information}
                            onChange={async (e) => {
                              try {
                                await db.info.put({
                                  ...info,
                                  information: e.target.value,
                                });
                              } catch (error) {
                                console.error("Error updating info:", error);
                                enqueueSnackbar("Error updating info", {
                                  variant: "error",
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => deletePrerequisite(info.id)}
                            sx={{
                              color: "#ef4444",
                              "&:hover": {
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <MuiButton
                  variant="contained"
                  onClick={handleAddInfo}
                  startIcon={<AddIcon />}
                >
                  Add Information
                </MuiButton>
              </Box>
            </Box>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1e293b" }}>
                Prerequisites
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                  mb: 2,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Actor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prerequisites.map((prereq, index) => (
                      <TableRow key={prereq.id}>
                        <TableCell>{prereq.number}</TableCell>
                        <TableCell>
                          <Select
                            value={prereq.type}
                            onChange={(e) => {
                              updatePrerequisite(prereq.id, {
                                type: e.target.value as DeploymentStep["type"],
                              });
                            }}
                            sx={{
                              minWidth: 120,
                              "& .MuiSelect-select": {
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "white",
                                backgroundColor: typeOptions.find(
                                  (t) => t.value === prereq.type
                                )?.color,
                                borderRadius: "6px",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "& .MuiSelect-icon": {
                                color: "white",
                              },
                            }}
                          >
                            {typeOptions.map((type) => (
                              <MenuItem
                                key={type.value}
                                value={type.value}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  color: "white",
                                  backgroundColor: type.color,
                                  "&:hover": {
                                    backgroundColor: type.color,
                                    filter: "brightness(90%)",
                                  },
                                }}
                              >
                                {type.icon}
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={prereq.name}
                            onChange={(e) => {
                              if (prereq && prereq.id) {
                                updatePrerequisite(prereq.id, {
                                  name: e.target.value,
                                });
                              }
                            }}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={4}
                            value={prereq.action}
                            onChange={(e) => {
                              if (prereq && prereq.id) {
                                updatePrerequisite(prereq.id, {
                                  action: e.target.value,
                                });
                              }
                            }}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={prereq.actor}
                            onChange={(e) => {
                              if (prereq && prereq.id) {
                                updatePrerequisite(prereq.id, {
                                  actor: e.target.value,
                                });
                              }
                            }}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              prereq.isDone ? <CheckCircleIcon /> : undefined
                            }
                            label={prereq.isDone ? "DONE" : "TODO"}
                            onClick={() =>
                              updatePrerequisite(prereq.id, {
                                isDone: !prereq.isDone,
                              })
                            }
                            sx={{
                              backgroundColor: prereq.isDone
                                ? "rgba(34, 197, 94, 0.1)"
                                : "rgba(234, 179, 8, 0.1)",
                              color: prereq.isDone
                                ? "rgb(21, 128, 61)"
                                : "rgb(161, 98, 7)",
                              fontWeight: "600",
                              borderRadius: "6px",
                              cursor: "pointer",
                              border: `1px solid ${
                                prereq.isDone
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : "rgba(234, 179, 8, 0.2)"
                              }`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => deletePrerequisite(prereq.id)}
                            sx={{
                              color: "#ef4444",
                              "&:hover": {
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <MuiButton
                  variant="contained"
                  onClick={handleAddPrerequisite}
                  startIcon={<AddIcon />}
                >
                  Add Prerequisite
                </MuiButton>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ mb: 2, color: "#1e293b" }}>
              Deployment Steps
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                maxHeight: "inherit",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  background: "rgba(0, 0, 0, 0.03)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0, 0, 0, 0.1)",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "rgba(0, 0, 0, 0.15)",
                  },
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Datetime</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {steps.map((step, index) => (
                    <TableRow
                      key={step.id}
                      sx={{
                        opacity: step.isDone ? 0.85 : 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    >
                      <TableCell>{step.number}</TableCell>
                      <TableCell>
                        {new Date(step.datetime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={step.type}
                          onChange={(e) =>
                            updateStep(step.id, { type: e.target.value })
                          }
                          sx={{
                            minWidth: 120,
                            "& .MuiSelect-select": {
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              color: "white",
                              backgroundColor: typeOptions.find(
                                (t) => t.value === step.type
                              )?.color,
                              borderRadius: "6px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                            "& .MuiSelect-icon": {
                              color: "white",
                            },
                          }}
                        >
                          {typeOptions.map((type) => (
                            <MenuItem
                              key={type.value}
                              value={type.value}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "white",
                                backgroundColor: type.color,
                                "&:hover": {
                                  backgroundColor: type.color,
                                  filter: "brightness(90%)",
                                },
                              }}
                            >
                              {type.icon}
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={step.name}
                          onChange={(e) =>
                            updateStep(step.id, { name: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          maxRows={4}
                          value={step.action}
                          onChange={(e) =>
                            updateStep(step.id, { action: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={step.actor}
                          onChange={(e) =>
                            updateStep(step.id, { actor: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={step.isDone ? <CheckCircleIcon /> : undefined}
                          label={step.isDone ? "DONE" : "TODO"}
                          onClick={() =>
                            updateStep(step.id, { isDone: !step.isDone })
                          }
                          sx={{
                            backgroundColor: step.isDone
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(234, 179, 8, 0.1)",
                            color: step.isDone
                              ? "rgb(21, 128, 61)"
                              : "rgb(161, 98, 7)",
                            fontWeight: "600",
                            borderRadius: "6px",
                            cursor: "pointer",
                            border: `1px solid ${
                              step.isDone
                                ? "rgba(34, 197, 94, 0.2)"
                                : "rgba(234, 179, 8, 0.2)"
                            }`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => deleteStep(step.id)}
                          sx={{
                            color: "#ef4444",
                            "&:hover": {
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                "& .MuiIconButton-root": {
                  border: "2px dashed rgba(51, 65, 85, 0.2)",
                  borderRadius: "12px",
                  p: 2,
                  background: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 1)",
                    transform: "scale(1.1)",
                    borderColor: "rgba(51, 65, 85, 0.4)",
                  },
                  transition: "all 0.2s ease",
                },
              }}
            >
              <MuiButton
                variant="contained"
                onClick={handleAddStep}
                startIcon={<AddIcon />}
              >
                Add Deployment Step
              </MuiButton>
            </Box>
          </Box>
        </Box>
      </Container>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      <PresenceIndicator deploymentId={deploymentId} />
    </>
  );
};

export default Index;
