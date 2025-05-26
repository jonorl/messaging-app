import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagingApp() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Hardcoding user for now
  const you = "5b8872a0-dae5-4a21-8a00-5861f8d446b5";

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/messages", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setMessages(data.messages);

        // Derive contacts from messages
        const contactMap = new Map();
        data.messages.forEach((msg) => {
          const otherId = msg.senderId === you ? msg.receiverId : msg.senderId;
          const otherName = msg.senderId === you ? msg.receiver : msg.sender;
          if (!contactMap.has(otherId)) {
            contactMap.set(otherId, otherName);
          }
        });
        setContacts(Array.from(contactMap.entries()));

        if (Array.from(contactMap.keys()).length > 0) {
          setSelectedContactId(Array.from(contactMap.keys())[0]);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }

    fetchMessages();
  }, []);

const sendMessage = async () => {
  if (newMessage.trim() === "" || !selectedContactId) return;

  const tempMessage = {
    id: messages.length + 1,
    senderId: you,
    receiverId: selectedContactId,
    sender: "You",
    text: newMessage,
  };

  // Optimistically update UI
  setMessages([...messages, tempMessage]);
  setNewMessage("");

  try {
    const response = await fetch("http://localhost:3000/api/v1/messages/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: you,
        text: newMessage,
        receiverId: selectedContactId,
      }),
    });

    const result = await response.json();
    console.log("Message sent to API:", result);
  } catch (error) {
    console.error("Failed to send message:", error);
    // You could roll back the optimistic update here if needed
  }
};

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.senderId === you && msg.receiverId === selectedContactId) ||
      (msg.receiverId === you && msg.senderId === selectedContactId)
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 text-xl font-bold">Messaging App</header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-200 p-4 overflow-y-auto border-r">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          <ul className="space-y-2">
            {contacts.map(([id, name]) => (
              <li
                key={id}
                className={`cursor-pointer p-2 rounded-lg ${
                  id === selectedContactId ? "bg-blue-400 text-white" : "hover:bg-gray-300"
                }`}
                onClick={() => setSelectedContactId(id)}
              >
                {name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-1 p-4">
          <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-white shadow-md rounded-2xl">
            <CardContent className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${
                    msg.senderId === you
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
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-inner p-4 text-center text-sm text-gray-500">
        Messaging App © 2025
      </footer>
    </div>
  );
}
