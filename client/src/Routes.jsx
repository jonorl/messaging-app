import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./LoginPage"
import Signup from "./Signup"
import Customise from "./Customise"

const hasSubfolder = window.location.pathname.startsWith("/messaging-app");
const basename = hasSubfolder ? "/messaging-app" : "/";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
        {
        path: "/login/",
        element: < Login />
    } ,
        {
        path: "/signup/",
        element: < Signup />
    } ,
        {
        path: "/customise/",
        element: < Customise />
    } 
], { basename });

export default router;
