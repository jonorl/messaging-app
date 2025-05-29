import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"

export default function LoginPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [progress, setProgress] = useState(13)

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

    const handleLogin = async () => {
        try {
            const response = await fetch(`${host}/api/v1/login`, {
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

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
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
            <header className="bg-gray-800 shadow-md px-4 py-2 flex justify-between items-center gap-2 sm:gap-4 overflow-x-auto">

                <Link to="/" className="text-base sm:text-lg md:text-xl font-bold hover:text-blue-400 whitespace-nowrap">
                    Messaging App
                </Link>
                <div className=" flex gap-2 sm:gap-4 items-center">
                    {loadingUser ? (
                        <div className="flex items-center justify-center w-full space-x-4">
                            <Progress value={progress} className="w-full max-w-xs h-2 bg-gray-300" />
                            <span className="text-sm font-medium text-white whitespace-nowrap">
                                Loading user...
                            </span>
                        </div>
                    ) : !user ? (
                        <>
                            <Button onClick={handleGuestLogin} className="px-2 sm:px-3 py-1 text-xs sm:text-sx hover:bg-gray-700">Guest login</Button>
                            <Link to="/signup"><Button className="px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-gray-700">Sign Up</Button></Link>
                            <Link to="/login"><Button className="px-2 sm:px-3 py-1 text-xs sm:text-sm hover:bg-gray-700">Login</Button></Link>
                        </>
                    ) : (
                        <>
                            <Link to="/customise">
                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                                    <AvatarImage
                                        src={user.profilePicture ? `${host}${user.profilePicture}` : undefined}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="text-gray-500">{user.name?.[0]}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <Link className="flex text-lg font-semibold items-center" to="/customise">
                                <h2 className="text-sm sm:text-base truncate whitespace-nowrap max-w-[70px] sm:max-w-none">
                                    Hello, {user.name}
                                </h2>

                            </Link>
                            <Button onClick={logout} className="px-3 py-1 text-xs sm:text-sm hover:bg-gray-700">Logout</Button>
                        </>
                    )}
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
                Messaging App © 2025 / jonorl@gmail.com
            </footer>
        </div>
    );
}
