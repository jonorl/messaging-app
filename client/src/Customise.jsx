// React import
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// ShadCN/UI components
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
} from "@/components/ui/alert-dialog"

export default function Customise() {

    // Hooks
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true); // loader/spinner related
    const [progress, setProgress] = useState(13); // loader/spinner related

    // to redirect
    const navigate = useNavigate();

    // fetch JWT token from localstorage
    const token = localStorage.getItem("token");

    // Fetching the hostname from .env to avoid hardcoding server site
    const host = import.meta.env.VITE_LOCALHOST

    // Progress bar / spinner
    useEffect(() => {
        const timer = setTimeout(() => setProgress(66), 500)
        return () => clearTimeout(timer)
    }, [])

    // Fetch userdata logic
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
    }, [token, host]);

    // Customise user form submit logic
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

    // Logout button simply removes the JWT token
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    // Delete user logic
    const deleteProfile = async () => {
        try {
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

    // Triggers guest login, which creates a new generic user
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
                            <Button onClick={handleGuestLogin} className="hover:bg-gray-700">Guest login</Button>
                            <Link to="/signup"><Button className="hover:bg-gray-700">Sign Up</Button></Link>
                            <Link to="/login"><Button className="hover:bg-gray-700">Login</Button></Link>
                        </>
                    ) : (
                        <>
                            <Link to="/customise">
                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 flex-shrink-0">
                                    <AvatarImage
                                        src={user.profilePicture ? `${user.profilePicture}` : undefined}
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
                <Card className="w-full max-w-md bg-gray-800 p-6 rounded-xl">
                    <CardContent className="space-y-6">
                        <h2 className="text-white text-2xl font-bold text-center">Customise Profile</h2>
                        <div className="flex justify-center">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={`${avatarFile}`} alt={user?.name} />
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
                Messaging App © 2025 / jonorl@gmail.com
            </footer>
        </div>

    );
}
