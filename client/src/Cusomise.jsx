import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Customise() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            if (!token) return;
            try {
                const res = await fetch("http://localhost:3000/api/v1/me", {
                    headers: { authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setUser(data.user);
                setName(data.user.name);
                setEmail(data.user.email);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        }

        fetchUser();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        if (avatarFile) formData.append("avatar", avatarFile);

        try {
            const res = await fetch("http://localhost:3000/api/v1/users/update-profile", {
                method: "PUT",
                headers: {
                    authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to update profile");
            navigate("/");
        } catch (err) {
            console.error(err);
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
                <Card className="w-full max-w-md bg-gray-800 p-6 rounded-xl">
                    <CardContent className="space-y-6">
                        <h2 className="text-white text-2xl font-bold text-center">Customise Profile</h2>
                        <div className="flex justify-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                                <AvatarFallback>{user?.name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-gray-700 text-white"
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-700 text-white"
                            />
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label className="text-white" htmlFor="picture">Add profile image</Label>
                                <Input className="bg-gray-700 text-white" id="picture" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                            </div>
                            <Button type="submit" className="w-full hover:bg-gray-700">
                                Save Changes
                            </Button>
                        </form>
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
