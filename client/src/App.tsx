import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./routes/Home";
import FieldPage from "./routes/FieldPage";
import ErrorPage from "./routes/ErrorPage";
import Signin from "./routes/SignIn";
import Register from "./routes/SignUp";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Signin,
  },
  {
    path: "/signup",
    Component: Register,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/field",
    Component: FieldPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password/:token",
    Component: ResetPassword,
  },
  {
    path: "*",
    Component: ErrorPage,
  },
]);

function App() {
  return <div> <RouterProvider router={router} /> </div>;
}

export default App;
