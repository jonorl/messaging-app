import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function MessagingApp() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [favourites, setFavourites] = useState({});
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchUser() {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:3000/api/v1/me", {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }

    fetchUser();
  }, [token]);

  useEffect(() => {
    async function fetchData() {
      if (!token || !user) return;
      try {
        const messagesRes = await fetch("http://localhost:3000/api/v1/messages", {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages);

        const contactMap = new Map();
        messagesData.messages.forEach((msg) => {
          const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
          const otherName = msg.senderId === user.id ? msg.receiver : msg.sender;
          if (!contactMap.has(otherId)) contactMap.set(otherId, otherName);
        });
        setContacts(Array.from(contactMap.entries()));
        if (Array.from(contactMap.keys()).length > 0) {
          setSelectedContactId(Array.from(contactMap.keys())[0]);
        }

        const usersRes = await fetch("http://localhost:3000/api/v1/users", {
          headers: { authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        console.log("usersData: ", usersData)
        setAllUsers(usersData.users);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, [token, user,]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        senderId: user.id,
        receiverId: selectedContactId,
        sender: "You",
        text: newMessage,
      },
    ]);
    setNewMessage("");
    try {
      const response = await fetch("http://localhost:3000/api/v1/messages/", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user.id,
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
      (msg.senderId === user?.id && msg.receiverId === selectedContactId) ||
      (msg.receiverId === user?.id && msg.senderId === selectedContactId)
  );

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const toggleFavourite = (userId) => {
    setFavourites((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold cursor-pointer hover:text-blue-400">
          Messaging App
        </Link>
        <div className="space-x-2 flex">
          {!user && (
            <>
              <Link to="/guest"><Button className="hover:bg-gray-700">Guest login</Button></Link>
              <Link to="/signup"><Button className="hover:bg-gray-700">Sign Up</Button></Link>
              <Link to="/login"><Button className="hover:bg-gray-700">Login</Button></Link>
            </>
          )}
          {user && (
            <>
              <h2 className="flex text-lg font-semibold self-center">Hello, {user.name}</h2>
              <Button onClick={logout} className="hover:bg-gray-700">Logout</Button>
              <Link to="/customise"><Button className="hover:bg-gray-700">Customise Profile</Button></Link>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700 space-y-6">
          {/* Conversations */}
          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Conversations</h2>
              <ul className="space-y-2">
                {contacts.map(([id, name]) => (
                  <li
                    key={id}
                    className={`cursor-pointer p-2 rounded-lg ${id === selectedContactId ? "bg-blue-500 text-white" : "hover:bg-gray-700"
                      }`}
                    onClick={() => setSelectedContactId(id)}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Favourites */}
          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Favourites</h2>
              <ul className="space-y-2">
                {allUsers.filter((u) => favourites[u.id]).map((u) => (
                  <li
                    key={u.id}
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                    onClick={() => setSelectedContactId(u.id)}
                  >
                    <span>{u.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavourite(u.id); }}>
                      ❤️
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All Users */}
          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">All Users</h2>
              <ul className="space-y-2">
                {allUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                    onClick={() => setSelectedContactId(u.id)}
                  >
                    <span>{u.name}</span>
                    <button onClick={() => toggleFavourite(u.id)}>
                      {favourites[u.id] ? "❤️" : "🤍"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-1 p-4">
          {user ? (
            <>
              <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 text-white shadow-md rounded-2xl">
                <CardContent className="space-y-4">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${msg.senderId === user.id ? "ml-auto bg-blue-600 text-white" : "mr-auto bg-gray-700 text-white"
                        }`}
                    >
                      <p className="text-sm font-semibold">{msg.sender}</p>
                      <p>{msg.text}</p>
                      {msg.createdAt && (
                        <p className="text-xs text-gray-300 mt-1 text-right">
                          {formatDate(msg.createdAt)}
                        </p>
                      )}
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
            </>
          ) : (
            <div className="text-center text-lg text-gray-300 mt-20">
              Please log in to view and send messages.
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 shadow-inner p-4 text-center text-sm text-gray-400">
        Messaging App © 2025
      </footer>
    </div>
  );
}
