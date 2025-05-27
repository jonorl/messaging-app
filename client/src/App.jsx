import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"

const host = import.meta.env.VITE_LOCALHOST;

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
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [progress, setProgress] = useState(13)
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesRef = useRef(messages);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  // Tell backend I'm online
  useEffect(() => {
    if (!token || !user) return;

    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/online", {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOnlineUsers(data.online || []);
      } catch (err) {
        console.error("Failed to fetch online users:", err);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000); // every 10s
    return () => clearInterval(interval);
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    // Show online users

    const intervalId = setInterval(() => {
      fetch("http://localhost:3000/api/v1/heartbeat", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, [token, user]);

  // useEffect hook for getting user data
  useEffect(() => {
    async function fetchUser() {
      if (!token) return;
      setLoadingUser(true);
      try {
        const res = await fetch("http://localhost:3000/api/v1/me", {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, [token]);

  // useEffect for Messages and Contacts
  useEffect(() => {
    if (!token || !user) {
      setLoadingMessages(false);
      setLoadingUser(false);

      return;
    }
    let isInitialLoad = true;

    async function fetchMessages() {
      // Only show loading on initial load, not on polling
      if (isInitialLoad) {
        setLoadingMessages(true);
      }

      try {
        const messagesRes = await fetch("http://localhost:3000/api/v1/messages", {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const messagesData = await messagesRes.json();

        const stringify = JSON.stringify;
        if (stringify(messagesData.messages) !== stringify(messagesRef.current)) {
          setMessages(messagesData.messages);
          messagesRef.current = messagesData.messages;

          // Only rebuild contacts if messages changed
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
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        if (isInitialLoad) {
          setLoadingMessages(false);
          isInitialLoad = false;
        }
      }
    }

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [token, user]);

  // useEffect for Favourites
  useEffect(() => {
    if (!token) return;

    async function fetchFavourites() {
      try {
        const favouritesRes = await fetch("http://localhost:3000/api/v1/favourite", {
          headers: { authorization: `Bearer ${token}` },
        });
        const favouritesData = await favouritesRes.json();
        console.log("Favorites data:", favouritesData);
        setFavourites(favouritesData.favouriteIdsMap || {});
      } catch (err) {
        console.error("Error fetching favourites:", err);
      }
    }

    fetchFavourites();
  }, [token]);

  // useEffect for Users
  useEffect(() => {
    if (!token) return;

    async function fetchUsers() {
      try {
        const usersRes = await fetch("http://localhost:3000/api/v1/users", {
          headers: { authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setAllUsers(usersData.users);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }

    fetchUsers();
  }, [token]);

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

  const toggleFavourite = async (userId) => {
    // Optimistically update the UI
    setFavourites((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));

    try {
      const response = await fetch("http://localhost:3000/api/v1/favourite/", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favUser: userId,
        }),
      });
      const result = await response.json();
      console.log("Favourite toggle result:", result);
    } catch (error) {
      console.error("Failed to toggle favourite:", error);
      // Revert the optimistic update on error
      setFavourites((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold cursor-pointer hover:text-blue-400">
          Messaging App
        </Link>
        <div className="space-x-2 flex">
          {loadingUser ? (
            <div className="flex items-center justify-center w-full space-x-4">
              <Progress
                value={progress}
                className="w-48 h-2 bg-gray-300"
              />
              <span className="text-sm font-medium text-white whitespace-nowrap">
                Loading user...
              </span>
            </div>
          ) : !user ? (
            <>
              <Link to="/guest"><Button className="hover:bg-gray-700">Guest login</Button></Link>
              <Link to="/signup"><Button className="hover:bg-gray-700">Sign Up</Button></Link>
              <Link to="/login"><Button className="hover:bg-gray-700">Login</Button></Link>
            </>
          ) : (
            <>
              <Link to="/customise"><Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                <AvatarImage
                  src={user.profilePicture ? `${host}${user.profilePicture}` : undefined}
                  alt={user.name}
                />
                <AvatarFallback className="text-gray-500">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              </Link>
              <Link className="flex text-lg font-semibold items-center" to="/customise"><h2>Hello, {user.name}</h2></Link>
              <Button onClick={logout} className="hover:bg-gray-700">Logout</Button>
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
                {contacts.map(([id, name]) => {
                  const contactUser = allUsers.find((u) => u.id === id);
                  return (
                    <li
                      key={id}
                      className={`cursor-pointer flex items-center space-x-2 p-2 rounded-lg ${id === selectedContactId
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-700"
                        }`}
                      onClick={() => setSelectedContactId(id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contactUser?.profilePicture && `${host}${contactUser.profilePicture}`} alt={contactUser?.name} />
                        <AvatarFallback className="text-gray-500">{contactUser?.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Favourites */}
          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Favourites (see if online)</h2>
              <ul className="space-y-2">
                {allUsers
                  .filter((u) => favourites[u.id] === true)
                  .map((u) => (
                    <li
                      key={u.id}
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                      onClick={() => setSelectedContactId(u.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`${host}${u.profilePicture}`} alt={u.name} />
                          <AvatarFallback className="text-gray-500">{u.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                      </div>
                      <div className="flex justify-end items-center">
                        {console.log(onlineUsers)}
                        {onlineUsers.includes(u.id) && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full mr-2 ${onlineUsers.includes(u.id) ? "bg-green-500" : "bg-red-500"
                              }`}
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavourite(u.id);
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          ❤️
                        </button>
                      </div>
                    </li>
                  ))}
                {allUsers.filter((u) => favourites[u.id] === true).length === 0 && (
                  <li className="text-gray-400 text-sm italic p-2">No favourites yet</li>
                )}
              </ul>
            </div>
          )}

          {/* All Users */}
          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">All Users</h2>
              <ul className="space-y-2">
                {allUsers
                  .filter((u) => u.id !== user.id) // Don't show the current user
                  .map((u) => (
                    <li
                      key={u.id}
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                      onClick={() => setSelectedContactId(u.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`${host}${u.profilePicture}`} alt={u.name} />
                          <AvatarFallback className="text-gray-500">{u.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavourite(u.id);
                        }}
                        className={favourites[u.id] ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-300"}
                      >
                        {favourites[u.id] ? "❤️" : "🤍"}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-1 p-4 ">
          {loadingMessages ? (
            <div className="flex flex-col justify-center items-center flex-1">
              <div className="text-gray-400 text-lg animate-pulse mb-8">Loading messages...</div>
              <Progress value={progress} className="w-[60%] h-2 bg-gray-300" />
            </div>
          ) : user ? (
            <>
              <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 text-white shadow-md rounded-2xl">
                <CardContent className="space-y-4">
                  {filteredMessages.map((msg) => {
                    const isCurrentUser = msg.senderId === user.id;
                    const senderUser = allUsers.find((u) => u.id === msg.senderId);
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 ${isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarImage
                              src={
                                senderUser?.profilePicture
                                  ? `${host}${senderUser.profilePicture}`
                                  : undefined
                              }
                              alt={senderUser?.name}
                            />
                            <AvatarFallback className="text-gray-500">
                              {senderUser?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-xs`}>
                          <p className="text-xs text-gray-400 mb-1 px-1">
                            {msg.sender}
                          </p>
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-md relative ${isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-gray-700 text-white rounded-bl-md"
                              }`}
                          >
                            <p className="break-words">{msg.text}</p>
                            {msg.createdAt && (
                              <p className="text-xs text-gray-300 mt-2 opacity-75">
                                {formatDate(msg.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        {isCurrentUser && (


                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarImage
                              src={
                                user.profilePicture ? `${host}${user.profilePicture}` : undefined
                              }
                              alt={user.name}
                            />
                            <AvatarFallback className="text-gray-500">
                              {user.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Message Input */}
              <div className="flex items-center gap-3 mt-4 p-3 bg-gray-800 rounded-xl shadow-md">
                <Input
                  type="text"
                  className="flex-1 bg-gray-700 border-gray-600 text-white rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button
                  className="hover:bg-blue-700 bg-blue-600 rounded-full px-6 py-2 transition-colors duration-200"
                  onClick={sendMessage}
                >
                  Send
                </Button>
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