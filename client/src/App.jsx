import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagingApp() {

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([])
  const you = "5b8872a0-dae5-4a21-8a00-5861f8d446b5"

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/messages", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("data", data)
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

    fetchMessages();
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: messages.length + 1, senderId: you, text: newMessage },
    ]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Messaging App</h1>
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-white shadow-md rounded-2xl">
        <CardContent className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${msg.senderId === you
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-black"
                }`}
            >
              <p className="text-sm font-semibold">{msg.sender}</p>
              <p>{msg.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex items-center gap-2 mt-4">
        <Input
          type="text"
          className="flex-1"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
