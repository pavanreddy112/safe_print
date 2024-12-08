import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

const UserChat = ({ userId }) => {
  const { shopId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("joinChat", { userId, shopId });

    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.close();
  }, [shopId, userId]);

  // Fetch shop owner id from the backend (optional)
  useEffect(() => {
    const fetchOwnerId = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/shops/${shopId}`);
        setOwnerId(response.data.ownerId);
      } catch (error) {
        console.error("Error fetching owner ID:", error);
      }
    };

    fetchOwnerId();
  }, [shopId]);

  const sendMessage = async () => {
    // Don't send if both message and file are empty
    if (!message.trim() && !file) return;

    const payload = {
      senderId: userId,
      receiverId: ownerId,
      shopId: shopId,
      text: message.trim() || null, // If message is empty, set to null
      fileUrl: null, // Handle file separately
    };

    // Handle sending text message
    if (message.trim()) {
      setMessages((prev) => [...prev, { sender: "You", text: message }]);
      setMessage(""); // Clear the message field
    }

    // Handle sending file
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId); // Add userId to the form data
      formData.append("shopId", shopId); // Add shopId to the form data
      formData.append("ownerId", ownerId); // Add ownerId to the form data

      try {
        const response = await axios.post("http://localhost:5000/api/chat/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const fileUrl = response.data.fileUrl;
        payload.fileUrl = fileUrl; // Assign the file URL to the payload

        setMessages((prev) => [
          ...prev,
          { sender: "You", text: <a href={fileUrl} target="_blank" rel="noopener noreferrer">View File</a> },
        ]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    // Send the message or file (or both) to the backend
    try {
      await axios.post("http://localhost:5000/api/chat/messages", payload);
      socket.emit("sendMessage", payload);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={sendMessage}>Upload</button>
    </div>
  );
};

export default UserChat;
