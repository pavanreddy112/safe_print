import React, { useState, useEffect } from "react";
import axios from "axios";
import routes from "../routes";
import ChatBox from "../components/Chat/ChatBox";

const SecureCommunication = ({ shopId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(routes.fetchMessages, { params: { shopId } });
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [shopId]);

  const handleSendMessage = async () => {
    try {
      const response = await axios.post(routes.sendMessage, { shopId, content: newMessage });
      setMessages([...messages, response.data.message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <ChatBox
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default SecureCommunication;
