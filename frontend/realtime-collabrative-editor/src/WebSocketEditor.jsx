import { useEffect, useRef, useState } from "react";

export default function WebSocketEditor() {
  const [messages, setMessages] = useState([]); // To display received messages
  const [input, setInput] = useState(""); // For the text area input
  const socket = useRef(null); // Ref to hold the WebSocket instance
  const sessionId ="24f9ab94-4cea-4831-80ce-5b48bb3c0630"

  // A dummy token for initial testing, as our interceptor is in diagnostic mode.
  // Replace with a real token later when JWT validation is enabled.
  const dummyToken = localStorage.getItem('token')
  useEffect(() => {
    // Construct the WebSocket URL. We'll add a dummy token for now.
    // When you enable JWT validation on the server, ensure this is a *valid* token.
    const wsUrl = `ws://localhost:8080/ws/editor?token=${dummyToken}&sessionId=${sessionId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected successfully!");
      // Assign the WebSocket instance to the ref
      socket.current = ws;
    };

    ws.onmessage = (event) => {
      console.log("Message received from server:", event.data);
      // Update state to display the received message
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    ws.onclose = (event) => {
      console.log("WebSocket Closed:", event.code, event.reason);
      socket.current = null; // Clear the ref on close
    };

    // Cleanup function: close WebSocket when component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const sendMessage = () => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log("Sending message:", input);
      socket.current.send(input);
      setInput(""); // Clear input after sending
    } else {
      console.warn("WebSocket is not open. Cannot send message.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 WebSocket Editor</h1>
      <textarea
        rows="4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Type code here..."
      ></textarea>
      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send
      </button>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Received Messages:</h2>
        <ul className="list-disc pl-6 mt-2">
          {messages.map((msg, idx) => (
            <li key={idx} className="text-sm text-gray-700 break-words">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}