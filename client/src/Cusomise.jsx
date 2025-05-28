import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Customise() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
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
                console.log("data", data)
                setUser(data.user);
                setName(data.user.name);
                setEmail(data.user.email);
                setAvatarFile(data.user.profilePicture)
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoadingUser(false);
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
            const res = await fetch(`${host}/api/v1/users/`, {
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

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    const deleteProfile = async () => {
        try {
            if (user.email === "guest@messaging.com") {
                alert("The developer has blocked the guest account from being deleted.");
                return;
            }
            const res = await fetch(`${host}/api/v1/me/`, {
                method: "DELETE",
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to delete profile");
            if (res.ok) localStorage.removeItem("token");
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    }

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
                                    src={user.profilePicture ? `${host}/${user.profilePicture}` : undefined}
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
                <Card className="w-full max-w-md bg-gray-800 p-6 rounded-xl">
                    <CardContent className="space-y-6">
                        <h2 className="text-white text-2xl font-bold text-center">Customise Profile</h2>
                        <div className="flex justify-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={`${host}${avatarFile}`} alt={user?.name} />{console.log(`${host}${avatarFile}`)}
                                {<AvatarFallback>{user?.name?.[0] || "?"}</AvatarFallback>}
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
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                            </div>
                            <Button type="submit" className="w-full hover:bg-gray-700">
                                Save Changes
                            </Button>
                            <Button
                                type="button" // adding this to avoid submitting the form
                                onClick={() => setShowConfirmModal(true)}
                                className="w-full text-gray-200 hover:text-gray-600 bg-red-500 hover:bg-red-400">Delete Profile
                            </Button>
                            {showConfirmModal && (
                                <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                                    <AlertDialogContent className="bg-gray-800">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white text-lg font-semibold">Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="text-gray-200 hover:text-gray-300 bg-gray-600 hover:bg-gray-500">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-600 hover:bg-red-500 text-gray-200 hover:text-gray-600"
                                                onClick={deleteProfile}
                                            >
                                                Yes, delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

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
