import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagingApp() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Hardcoding user for now
  const navigate = useNavigate();
  const you = "5b8872a0-dae5-4a21-8a00-5861f8d446b5";
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/messages", {
          headers: {
            "Content-Type": "application/json",
            "authorization": `bearer ${token}`
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
  }, [token]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        senderId: you,
        receiverId: selectedContactId,
        sender: "You",
        text: newMessage,
      },
    ]);
    setNewMessage("");
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.senderId === you && msg.receiverId === selectedContactId) ||
      (msg.receiverId === you && msg.senderId === selectedContactId)
  );

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold cursor-pointer hover:text-blue-400">
          Messaging App
        </Link>
        <div className="space-x-2" >
          <Link to="/guest"><Button className="hover:bg-gray-700">Guest login</Button></Link>
          <Link to="/signup"><Button className="hover:bg-gray-700">Sign Up</Button></Link>
          <Link to="/login"><Button className="hover:bg-gray-700">Login</Button></Link>
          <Button onClick={logout} className="hover:bg-gray-700">Logout</Button>
          <Link to="/customise"><Button className="hover:bg-gray-700">Customise Profile</Button></Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          <ul className="space-y-2">
            {contacts.map(([id, name]) => (
              <li
                key={id}
                className={`cursor-pointer p-2 rounded-lg ${id === selectedContactId
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-700"
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
          <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 text-white shadow-md rounded-2xl">
            <CardContent className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${msg.senderId === you
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-gray-700 text-white"
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
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button className="hover:bg-gray-700" onClick={sendMessage}>Send</Button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 shadow-inner p-4 text-center text-sm text-gray-400">
        Messaging App © 2025
      </footer>
    </div>
  );
}
