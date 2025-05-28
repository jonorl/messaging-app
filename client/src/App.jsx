import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Paperclip, CirclePlus } from "lucide-react";

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
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [favourites, setFavourites] = useState({});
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [progress, setProgress] = useState(13);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const messagesRef = useRef(messages);
  const lastMessageRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Auto-scroll to the last message or bottom of container
  useEffect(() => {
    const scrollToBottom = () => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "auto" });
      } else if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, selectedContactId, selectedGroupId]);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  // Tell backend I'm online
  useEffect(() => {
    if (!token || !user) return;

    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch(`${host}/api/v1/online`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOnlineUsers(data.online || []);
      } catch (err) {
        console.error("Failed to fetch online users:", err);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    const intervalId = setInterval(() => {
      fetch(`${host}/api/v1/heartbeat`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token, user]);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      if (!token) return;
      setLoadingUser(true);
      try {
        const res = await fetch(`${host}/api/v1/me`, {
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

  // Fetch messages, contacts, and groups
  useEffect(() => {
    if (!token || !user) {
      setLoadingMessages(false);
      setLoadingUser(false);
      return;
    }
    let isInitialLoad = true;

    async function fetchMessagesAndGroups() {
      if (isInitialLoad) {
        setLoadingMessages(true);
      }

      try {
        // Fetch direct messages
        const messagesRes = await fetch(`${host}/api/v1/messages`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const messagesData = await messagesRes.json();

        // Fetch group messages if a group is selected
        let groupMessages = [];
        if (selectedGroupId) {
          const groupMessagesRes = await fetch(`${host}/api/v1/groups/${selectedGroupId}/messages`, {
            headers: {
              authorization: `Bearer ${token}`,
            },
          });
          const groupMessagesData = await groupMessagesRes.json();
          groupMessages = groupMessagesData.messages;
        }

        const allMessages = [...messagesData.messages, ...groupMessages];
        const stringify = JSON.stringify;
        if (stringify(allMessages) !== stringify(messagesRef.current)) {
          setMessages(allMessages);
          messagesRef.current = allMessages;

          const contactMap = new Map();
          messagesData.messages.forEach((msg) => {
            const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
            const otherName = msg.senderId === user.id ? msg.receiver : msg.sender;
            if (!contactMap.has(otherId)) contactMap.set(otherId, otherName);
          });
          const newContacts = Array.from(contactMap.entries());
          setContacts(newContacts);

          // Update selectedContactId only on initial load or if invalid
          if (isInitialLoad && (!selectedContactId || !selectedGroupId)) {
            setSelectedContactId(newContacts[0]?.[0] || null);
          } else if (selectedContactId && !newContacts.some(([id]) => id === selectedContactId)) {
            setSelectedContactId(newContacts[0]?.[0] || null);
          }
        }

        // Fetch groups
        const groupsRes = await fetch(`${host}/api/v1/groups`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const groupsData = await groupsRes.json();
        setGroups(groupsData.groups);
      } catch (err) {
        console.error("Error fetching messages or groups:", err);
      } finally {
        if (isInitialLoad) {
          setLoadingMessages(false);
          isInitialLoad = false;
        }
      }
    }

    fetchMessagesAndGroups();
    const intervalId = setInterval(fetchMessagesAndGroups, 5000);
    return () => clearInterval(intervalId);
  }, [token, user, selectedContactId, selectedGroupId]);

  // Fetch favourites
  useEffect(() => {
    if (!token) return;

    async function fetchFavourites() {
      try {
        const favouritesRes = await fetch(`${host}/api/v1/favourite`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const favouritesData = await favouritesRes.json();
        setFavourites(favouritesData.favouriteIdsMap || {});
      } catch (err) {
        console.error("Error fetching favourites:", err);
      }
    }

    fetchFavourites();
  }, [token]);

  // Fetch users
  useEffect(() => {
    if (!token) return;

    async function fetchUsers() {
      try {
        const usersRes = await fetch(`${host}/api/v1/users`, {
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
    if (newMessage.trim() === "" && !imageFile) return;

    const formData = new FormData();
    if (selectedGroupId) {
      formData.append("text", newMessage);
      formData.append("senderId", user.id);
      formData.append("groupId", selectedGroupId);
      if (imageFile) {
        formData.append("image", imageFile);
      }
    } else {
      formData.append("senderId", user.id);
      formData.append("receiverId", selectedContactId);
      formData.append("text", newMessage);
      if (imageFile) {
        formData.append("image", imageFile);
      }
    }

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        senderId: user.id,
        receiverId: selectedGroupId ? null : selectedContactId,
        groupId: selectedGroupId,
        sender: "You",
        text: newMessage,
        image: imageFile ? URL.createObjectURL(imageFile) : null,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      },
    ]);

    setNewMessage("");
    setImageFile(null);

    try {
      const endpoint = selectedGroupId
        ? `${host}/api/v1/groups/${selectedGroupId}/messages`
        : `${host}/api/v1/messages/`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Message sent to API:", result);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const createGroup = async () => {
    if (!groupName || selectedMembers.length === 0) return;

    try {
      const response = await fetch(`${host}/api/v1/groups`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          memberIds: selectedMembers,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setGroups([...groups, result.group]);
        setIsGroupDialogOpen(false);
        setGroupName("");
        setSelectedMembers([]);
      } else {
        console.error("Failed to create group:", result.message);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredMessages = messages.filter((msg) =>
    selectedGroupId
      ? msg.groupId === selectedGroupId
      : (msg.senderId === user?.id && msg.receiverId === selectedContactId) ||
      (msg.receiverId === user?.id && msg.senderId === selectedContactId)
  );

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const toggleFavourite = async (userId) => {
    setFavourites((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));

    try {
      const response = await fetch(`${host}/api/v1/favourite/`, {
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
      setFavourites((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await fetch(`${host}/api/v1/guest/`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/');
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Guest login error:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md px-4 py-2 flex flex-wrap justify-between items-center gap-2 sm:gap-4">
        <Link to="/" className="text-xl font-bold cursor-pointer hover:text-blue-400">
          Messaging App
        </Link>
        <div className="space-x-2 flex flex-wrap gap-2 items-center">
          {loadingUser ? (
            <div className="flex items-center justify-center w-full space-x-4">
              <Progress value={progress} className="w-full max-w-xs h-2 bg-gray-300" />
              <span className="text-sm font-medium text-white whitespace-nowrap">
                Loading user...
              </span>
            </div>
          ) : !user ? (
            <>
              <Button onClick={handleGuestLogin} className="hover:bg-gray-700">Guest login</Button>
              <Link to="/signup"><Button className="hover:bg-gray-700">Sign Up</Button></Link>
              <Link to="/login"><Button className="hover:bg-gray-700">Login</Button></Link>
            </>
          ) : (
            <>
              <Link to="/customise">
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarImage
                    src={user.profilePicture ? `${host}${user.profilePicture}` : undefined}
                    alt={user.name}
                  />
                  <AvatarFallback className="text-gray-500">{user.name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <Link className="flex text-lg font-semibold items-center" to="/customise">
                <h2 className="text-base sm:text-lg">Hello, {user.name}</h2>
              </Link>
              <Button onClick={logout} className="hover:bg-gray-700">Logout</Button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700 space-y-6">
          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Conversations</h2>
              <ul className="space-y-2">
                {contacts.map(([id, name]) => {
                  const contactUser = allUsers.find((u) => u.id === id);
                  return (
                    <li
                      key={id}
                      className={`cursor-pointer flex items-center space-x-2 p-2 rounded-lg ${id === selectedContactId && !selectedGroupId
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-700"
                        }`}
                      onClick={() => {
                        setSelectedContactId(id);
                        setSelectedGroupId(null);
                      }}
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

          {user && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Groups</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsGroupDialogOpen(true)}
                  className="text-gray-300 hover:text-white items-center"
                >
                  <CirclePlus className="w-48 h-48" />
                </Button>
              </div>
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group.id}
                    className={`cursor-pointer flex items-center space-x-2 p-2 rounded-lg ${group.id === selectedGroupId
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-700"
                      }`}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setSelectedContactId(null);
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-gray-500">{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{group.name}</span>
                  </li>
                ))}
                {groups.length === 0 && (
                  <li className="text-gray-400 text-sm italic p-2">No groups yet</li>
                )}
              </ul>
            </div>
          )}

          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogContent className="bg-gray-800 text-white">
              <DialogHeader>
                <DialogTitle className="mb-2">Create New Group</DialogTitle>
              </DialogHeader>
              <div >
                <div>
                  <Label htmlFor="group-name" className="text-gray-300 mb-4">Group Name</Label>
                  <Input
                    id="group-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="bg-gray-700 border-gray-600 text-white mb-4"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-4">Select Members</Label>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {allUsers
                      .filter((u) => u.id !== user?.id)
                      .map((u) => (
                        <li
                          key={u.id}
                          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${selectedMembers.includes(u.id) ? "bg-blue-600" : "hover:bg-gray-700"
                            }`}
                          onClick={() => toggleMember(u.id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`${host}${u.profilePicture}`} alt={u.name} />
                            <AvatarFallback className="text-gray-500">{u.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{u.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsGroupDialogOpen(false)}
                  className="bg-gray-700 text-white border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createGroup}
                  disabled={!groupName || selectedMembers.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                      onClick={() => {
                        setSelectedContactId(u.id);
                        setSelectedGroupId(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`${host}${u.profilePicture}`} alt={u.name} />
                          <AvatarFallback className="text-gray-500">{u.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>{u.name}</span>
                      </div>
                      <div className="flex justify-end items-center">
                        {onlineUsers.includes(u.id) && (
                          <span
                            className={`w-2.5 h-2.5 rounded-full mr-2 ${onlineUsers.includes(u.id) ? "bg-green-500" : "bg-red-500"}`}
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

          {user && (
            <div>
              <h2 className="text-lg font-semibold mb-2">All Users</h2>
              <ul className="space-y-2">
                {allUsers
                  .filter((u) => u.id !== user.id)
                  .map((u) => (
                    <li
                      key={u.id}
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-700 p-2 rounded-lg"
                      onClick={() => {
                        setSelectedContactId(u.id);
                        setSelectedGroupId(null);
                      }}
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
        <main className="flex flex-col flex-1 p-4">
          {loadingMessages ? (
            <div className="flex flex-col justify-center items-center flex-1">
              <div className="text-gray-400 text-lg animate-pulse mb-8">Loading messages...</div>
              <Progress value={progress} className="w-[90%] max-w-md h-2 bg-gray-300" />
            </div>
          ) : user ? (
            <>
              <Card className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 text-white shadow-md rounded-2xl" ref={chatContainerRef}>
                <CardContent className="space-y-4">
                  {filteredMessages.map((msg, index) => {
                    const isCurrentUser = msg.senderId === user.id;
                    const senderUser = allUsers.find((u) => u.id === msg.senderId);
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        ref={index === filteredMessages.length - 1 ? lastMessageRef : null}
                      >
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                            <AvatarImage
                              src={senderUser?.profilePicture ? `${host}${senderUser.profilePicture}` : undefined}
                              alt={senderUser?.name}
                            />
                            <AvatarFallback className="text-gray-500">{senderUser?.name?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} w-full max-w-[90%] sm:max-w-[75%]`}>
                          <p className="text-xs text-gray-400 mb-1 px-1">
                            {msg.sender?.name || msg.sender}
                          </p>
                          <div className={`px-4 py-3 rounded-2xl shadow-md relative ${isCurrentUser
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-700 text-white rounded-bl-md"}`}>
                            {msg.text && <p className="break-words mb-2">{msg.text}</p>}
                            {(msg.image || msg.imageUrl) && (
                              <img
                                src={`${host}${msg.image || msg.imageUrl}`}
                                alt="attachment"
                                className="w-full max-w-xs sm:max-w-sm rounded-md border border-gray-600"
                              />
                            )}
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
                              src={user.profilePicture ? `${host}${user.profilePicture}` : undefined}
                              alt={user.name}
                            />
                            <AvatarFallback className="text-gray-500">{user.name?.[0]}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center gap-2 mt-4 p-3 bg-gray-800 rounded-xl shadow-md">
                <Input
                  type="text"
                  className="flex-grow min-w-[50%] bg-gray-700 border-gray-600 text-white rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="file-upload"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="flex flex-1 cursor-pointer">
                    <Paperclip className="text-gray-300 hover:text-white w-5 h-5" />
                    {imageFile && (
                      <span className="text-sm text-gray-400 ml-2 truncate max-w-[100px]">
                        {imageFile.name}
                      </span>
                    )}
                  </label>
                </div>
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

      <footer className="bg-gray-800 shadow-inner p-4 text-center text-sm text-gray-400">
        Messaging App © 2025
      </footer>
    </div>
  );
}