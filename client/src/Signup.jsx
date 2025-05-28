import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"

export default function SignupPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [progress, setProgress] = useState(13)
  const [user, setUser] = useState(null);

  const host = import.meta.env.VITE_LOCALHOST

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setLoadingUser(false);
        return
      };
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

  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
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

      <main className="flex flex-col flex-1 p-4 overflow-hidden justify-center items-center">
        <Card className="w-full max-w-md p-6 bg-gray-800">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-white">Sign Up</h2>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button className="w-full hover:bg-gray-500" onClick={handleSignup}>
              Sign Up
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-800 shadow-inner p-4 text-center text-sm text-gray-400">
        Messaging App © 2025
      </footer>
    </div>
  );
}
