import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./LoginPage"
import Signup from "./Signup"
import Customise from "./Cusomise"

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
]);

export default router;
