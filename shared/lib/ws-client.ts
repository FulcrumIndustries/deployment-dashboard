export const websocketClient = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}`);
  return new Promise<WebSocket>((resolve) => {
    ws.onopen = () => resolve(ws);
  });
}; 