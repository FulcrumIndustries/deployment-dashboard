import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../shared/lib/db-setup";
import { Chip, Avatar } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

export default function PresenceIndicator({
  deploymentId,
}: {
  deploymentId?: string;
}) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [userId] = useState(() => localStorage.getItem("userId") || uuidv4());

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  useEffect(() => {
    if (!deploymentId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      newWs.send(
        JSON.stringify({
          type: "PRESENCE_UPDATE",
          deploymentId,
          userId,
          userName: "User " + Math.floor(Math.random() * 1000), // Replace with real username
        })
      );
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newWs.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "PRESENCE") {
        db.collaborators.bulkPut(msg.collaborators);
      }
    };

    setWs(newWs);

    return () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.close();
      }
    };
  }, [deploymentId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [ws]);

  const collaborators = useLiveQuery(async () => {
    if (!deploymentId) return [];
    return db.collaborators
      .where("deploymentId")
      .equals(deploymentId)
      .toArray();
  }, [deploymentId]);

  if (!collaborators?.length) return null;

  return (
    <div className="presence-bar">
      {collaborators.map((user) => (
        <Chip
          key={user.id}
          avatar={<Avatar>{user.name[0]}</Avatar>}
          label={user.name}
          variant="outlined"
        />
      ))}
    </div>
  );
}
