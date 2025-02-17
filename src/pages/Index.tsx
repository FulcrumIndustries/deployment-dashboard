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
import type { Deployment } from "../services/DeploymentDatabase";
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
import { db, DeploymentStep } from "../services/DeploymentDatabase";
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

interface Step {
  id: number;
  done: boolean;
  type: string; // You might use an enum or a more specific type later
  name: string;
  action: string;
  comment: string;
}

const mockDeployments: Deployment[] = [
  {
    id: "1",
    title: "Production Database Migration",
    description:
      "Scheduled database migration with zero downtime deployment strategy",
    date: new Date("2024-04-15"),
    category: "Infrastructure",
    createdAt: new Date(),
    steps: [],
  },
  {
    id: "2",
    title: "Security Patch Deployment",
    description:
      "Critical security updates for web servers and application endpoints",
    date: new Date("2024-04-20"),
    category: "Security",
    createdAt: new Date(),
    steps: [],
  },
  {
    id: "3",
    title: "Monitoring System Update",
    description: "Upgrade monitoring stack and implement new alert rules",
    date: new Date("2024-04-25"),
    category: "Monitoring",
    createdAt: new Date(),
    steps: [],
  },
];

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
    case "prerequisite":
      return <ListAltIcon />;
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
    color: "#00758F",
    icon: <StorageIcon />,
  },
  {
    value: "scripting",
    label: "Scripting",
    color: "#4EAA25",
    icon: <CodeIcon />,
  },
  {
    value: "api",
    label: "API",
    color: "#3776AB",
    icon: <ApiIcon />,
  },
  {
    value: "files",
    label: "Files",
    color: "#FFA500",
    icon: <FolderIcon />,
  },
  {
    value: "mail",
    label: "Mail",
    color: "#EA4335",
    icon: <EmailIcon />,
  },
  {
    value: "backup",
    label: "Backup",
    color: "#1E88E5",
    icon: <BackupIcon />,
  },
  {
    value: "monitor",
    label: "Monitor",
    color: "#7E57C2",
    icon: <MonitorIcon />,
  },
  {
    value: "configure",
    label: "Configure",
    color: "#43A047",
    icon: <TuneIcon />,
  },
  {
    value: "prerequisite",
    label: "Prerequisite",
    color: "#FB8C00",
    icon: <ListAltIcon />,
  },
  {
    value: "rollback",
    label: "Rollback",
    color: "#E53935",
    icon: <RestoreIcon />,
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
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<
    Deployment | undefined
  >();
  const [mode, setMode] = useState<"choice" | "new" | "existing">("choice");
  const [deploymentId, setDeploymentId] = useState("");
  const [steps, setSteps] = useState<DeploymentStep[]>([]);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(
    null
  );
  const [storedDeployments, setStoredDeployments] = useState<Deployment[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deploymentIdInput, setDeploymentIdInput] = useState("");
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
          const deployment = await db.deployments.get(id);
          if (!deployment) {
            navigate("/");
            enqueueSnackbar("Deployment not found", {
              variant: "error",
              anchorOrigin: { vertical: "bottom", horizontal: "center" },
            });
            return;
          }

          // Load the deployment steps
          const deploymentSteps = await db.steps
            .where("deploymentId")
            .equals(id)
            .toArray();

          // Sort steps by number
          deploymentSteps.sort((a, b) => a.number - b.number);

          setCurrentDeployment(deployment);
          setDeploymentId(id);
          setSteps(deploymentSteps);
        } catch (error) {
          console.error("Error loading deployment:", error);
          navigate("/");
          enqueueSnackbar("Error loading deployment", {
            variant: "error",
            anchorOrigin: { vertical: "bottom", horizontal: "center" },
          });
        }
      }
    };

    loadDeployment();
  }, [id, navigate]);

  React.useEffect(() => {
    if (!id) {
      const loadDeployments = async () => {
        try {
          const deployments = await db.deployments.toArray();
          // Sort by creation date, newest first
          deployments.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
          setStoredDeployments(deployments);
        } catch (error) {
          console.error("Error loading deployments:", error);
        }
      };
      loadDeployments();
    }
  }, [id]);

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

  const handleNewDeployment = () => {
    const newId = uuidv4();
    const newDeployment = {
      id: newId,
      title: "New Deployment",
      createdAt: new Date(),
      steps: [],
    };

    db.deployments.add(newDeployment).then(() => {
      setDeploymentId(newId);
      setCurrentDeployment(newDeployment);
      setSteps([]);
      setMode("existing");
      setStoredDeployments((prev) => [newDeployment, ...prev]);
      navigate(`/deployment/${newId}`);
    });
  };

  const handleExistingDeployment = async () => {
    if (!deploymentId) return;

    try {
      const deployment = await db.deployments.get(deploymentId);
      if (!deployment) {
        enqueueSnackbar("Deployment not found", {
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
        });
        return;
      }
      setCurrentDeployment(deployment);
      setSteps(deployment.steps || []);
      navigate(`/deployment/${deploymentId}`);
    } catch (error) {
      console.error("Error loading deployment:", error);
      enqueueSnackbar("Error loading deployment", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
  };

  const addStep = () => {
    const newStep: DeploymentStep = {
      id: Date.now(),
      deploymentId,
      number: steps.length + 1,
      type: "prerequisite",
      name: "",
      action: "",
      comment: "",
      isDone: false,
    };
    setSteps([...steps, newStep]);
    db.steps.add(newStep);
  };

  const updateStep = (
    index: number,
    field: keyof DeploymentStep,
    value: any
  ) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
    db.steps.update(updatedSteps[index].id, { [field]: value });
  };

  const deleteStep = (stepId: number) => {
    db.steps.delete(stepId);
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  const handleLoadDeployment = async () => {
    if (!deploymentIdInput) {
      enqueueSnackbar("Please enter a deployment ID", {
        variant: "warning",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
      return;
    }

    try {
      const deployment = await db.deployments.get(deploymentIdInput);
      if (!deployment) {
        enqueueSnackbar("Deployment not found", {
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "center" },
        });
        return;
      }
      navigate(`/deployment/${deploymentIdInput}`);
    } catch (error) {
      console.error("Error loading deployment:", error);
      enqueueSnackbar("Error loading deployment", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
  };

  const handleDeleteDeployment = async (deploymentId: string) => {
    try {
      await db.deployments.delete(deploymentId);
      // Also delete associated steps
      await db.steps.where("deploymentId").equals(deploymentId).delete();
      setStoredDeployments((prev) => prev.filter((d) => d.id !== deploymentId));
      enqueueSnackbar("Deployment deleted successfully", {
        variant: "success",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    } catch (error) {
      console.error("Error deleting deployment:", error);
      enqueueSnackbar("Error deleting deployment", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
    setDeleteDialogOpen(false);
    setDeploymentToDelete(null);
  };

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
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setCurrentDeployment((prev) =>
                    prev ? { ...prev, title: newTitle } : null
                  );
                  db.deployments.update(deploymentId, { title: newTitle });
                }}
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
                  onClick={() => {
                    navigator.clipboard.writeText(deploymentId);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
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
            <TableContainer
              component={Paper}
              sx={{
                background: "rgba(23, 25, 35, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxHeight: "inherit", // This will inherit from the parent
                overflowY: "auto", // Changed from default scroll
                "&::-webkit-scrollbar": {
                  width: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  opacity: 0, // Start with invisible scrollbar
                  transition: "opacity 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                  },
                },
                "&:hover::-webkit-scrollbar-thumb": {
                  opacity: 1, // Show scrollbar on hover
                },
                "& .MuiTableCell-head": {
                  color: "rgba(255, 255, 255, 0.95)",
                  borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
                  position: "sticky",
                  top: 0,
                  background: "rgba(23, 25, 35, 0.98)",
                  zIndex: 1,
                  fontWeight: 600,
                },
                "& .MuiTableCell-body": {
                  color: "rgba(255, 255, 255, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                },
                "& .MuiTextField-root": {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.07)",
                    color: "rgba(255, 255, 255, 0.9)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 0.13)",
                    },
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    "&::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                      opacity: 1,
                    },
                  },
                },
                "& .MuiTableRow-root:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05) !important",
                },
                "& .MuiTableRow-root.completed": {
                  backgroundColor: "rgba(34, 197, 94, 0.05)",
                  "&:hover": {
                    backgroundColor: "rgba(34, 197, 94, 0.08) !important",
                  },
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      padding="checkbox"
                      sx={{ width: "48px" }}
                    ></TableCell>
                    <TableCell sx={{ width: "60px" }}>ID</TableCell>
                    <TableCell sx={{ width: "180px" }}>Type</TableCell>
                    <TableCell sx={{ width: "200px" }}>Name</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell sx={{ width: "200px" }}>Comment</TableCell>
                    <TableCell sx={{ width: "100px" }}>Status</TableCell>
                    <TableCell sx={{ width: "60px" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {steps.map((step, index) => (
                    <TableRow
                      key={step.id}
                      className={step.isDone ? "completed" : ""}
                      sx={{
                        opacity: step.isDone ? 0.85 : 1,
                        transition: "all 0.2s ease",
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={step.isDone}
                          onChange={(e) =>
                            updateStep(index, "isDone", e.target.checked)
                          }
                          sx={{ "&.Mui-checked": { color: "#94a3b8" } }}
                        />
                      </TableCell>
                      <TableCell>{step.number}</TableCell>
                      <TableCell>
                        <Select
                          value={step.type}
                          onChange={(e) =>
                            updateStep(index, "type", e.target.value)
                          }
                          sx={{
                            width: "160px",
                            backgroundColor: typeOptions.find(
                              (t) => t.value === step.type
                            )?.color,
                            color: "white",
                            "& .MuiSelect-icon": { color: "white" },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                          }}
                        >
                          {typeOptions.map((type) => (
                            <MenuItem
                              key={type.value}
                              value={type.value}
                              sx={{
                                backgroundColor: type.color,
                                color: "white",
                                margin: "2px",
                                borderRadius: "4px",
                                "&:hover": {
                                  backgroundColor: type.color,
                                  filter: "brightness(90%)",
                                },
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {type.icon}
                                {type.label}
                              </span>
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={step.name}
                          onChange={(e) =>
                            updateStep(index, "name", e.target.value)
                          }
                          sx={{
                            opacity: step.isDone ? 0.85 : 1,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.07)",
                              color: "rgba(255, 255, 255, 0.9)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "rgba(255, 255, 255, 0.13)",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          minRows={1}
                          maxRows={4}
                          value={step.action}
                          onChange={(e) =>
                            updateStep(index, "action", e.target.value)
                          }
                          sx={{
                            opacity: step.isDone ? 0.85 : 1,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.07)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "rgba(255, 255, 255, 0.13)",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={step.comment}
                          onChange={(e) =>
                            updateStep(index, "comment", e.target.value)
                          }
                          sx={{
                            opacity: step.isDone ? 0.85 : 1,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "rgba(255, 255, 255, 0.07)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "rgba(255, 255, 255, 0.13)",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={step.isDone ? <CheckCircleIcon /> : undefined}
                          label={step.isDone ? "DONE" : "TODO"}
                          sx={{
                            backgroundColor: step.isDone
                              ? "rgba(34, 197, 94, 0.16)"
                              : "rgba(234, 179, 8, 0.16)",
                            color: step.isDone
                              ? "rgb(21, 128, 61)"
                              : "rgb(161, 98, 7)",
                            fontWeight: "600",
                            borderRadius: "6px",
                            border: `1px solid ${
                              step.isDone
                                ? "rgba(34, 197, 94, 0.32)"
                                : "rgba(234, 179, 8, 0.32)"
                            }`,
                            transition: "all 0.2s ease",
                            "& .MuiChip-icon": {
                              color: step.isDone
                                ? "rgb(21, 128, 61)"
                                : "rgb(161, 98, 7)",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
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
              <IconButton color="primary" onClick={addStep}>
                <AddIcon sx={{ fontSize: "1.5rem" }} />
              </IconButton>
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
    </>
  );
};

export default Index;
