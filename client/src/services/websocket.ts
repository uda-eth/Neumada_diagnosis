let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;
let socket: WebSocket | null = null;

const connectWebSocket = () => {
  // Get user ID from localStorage
  const userId = localStorage.getItem('maly_user_id');
  if (!userId) {
    console.log('No user ID available, skipping WebSocket connection');
    return;
  }

  // Base WebSocket URL (adjust based on your server settings)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws/chat/${userId}`;
  
  console.log('Connecting WebSocket using userId:', userId);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    reconnectAttempts = 0;
    console.log('WebSocket connection opened with userId:', userId);
    // Send initial connection message
    socket.send(JSON.stringify({
      type: 'connect',
      userId: userId
    }));
  };

  socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event);
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttempts})`);
        connectWebSocket();
      }, RECONNECT_DELAY);
    } else {
      console.error('Max reconnect attempts reached. Connection failed.');
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      // Handle different message types
      if (data.type === 'connected') {
        console.log('WebSocket connection confirmed:', data.message);
      } else if (data.type === 'error') {
        console.error('WebSocket error message:', data.message);
      } else {
        // Handle regular messages (can be expanded based on your app's needs)
        console.log('Message received:', data);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };
};

// Connect when the module is imported
connectWebSocket();

// Export functions to send messages and reconnect
export const sendWebSocketMessage = (receiverId: number, content: string) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected');
    return false;
  }
  
  const userId = localStorage.getItem('maly_user_id');
  if (!userId) {
    console.error('No user ID available');
    return false;
  }
  
  socket.send(JSON.stringify({
    senderId: parseInt(userId),
    receiverId,
    content
  }));
  
  return true;
};

export const reconnectWebSocket = () => {
  if (socket) {
    socket.close();
  }
  reconnectAttempts = 0;
  connectWebSocket();
};

export default {
  sendMessage: sendWebSocketMessage,
  reconnect: reconnectWebSocket
};