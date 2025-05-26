import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/v1/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem("token", data.token);
                navigate("/");
            } else {
                setError(data.message || "Login failed");
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
                <div className="space-x-2" >
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
                        <h2 className="text-2xl font-semibold text-center text-white">Login</h2>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Button className="w-full hover:bg-gray-500" onClick={handleLogin}>
                            Login
                        </Button>
                    </CardContent>
                </Card>
            </main>
            {/* Footer */}
            <footer className="bg-gray-800 shadow-inner p-4 text-center text-sm text-gray-400">
                Messaging App © 2025
            </footer>
        </div>
    );
}
