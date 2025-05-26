import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold cursor-pointer hover:text-blue-400">
          Messaging App
        </Link>
        <div className="space-x-2">
          <Link to="/guest"><Button className="hover:bg-gray-700">Guest login</Button></Link>
          <Link to="/signup"><Button className="hover:bg-gray-700">Sign Up</Button></Link>
          <Link to="/login"><Button className="hover:bg-gray-700">Login</Button></Link>
          <Link to="/logout"><Button className="hover:bg-gray-700">Logout</Button></Link>
          <Link to="/customise"><Button className="hover:bg-gray-700">Customise Profile</Button></Link>
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
