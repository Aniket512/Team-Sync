import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { router } from "./Routes";
import { store } from "./redux/store";
import axios from "axios";
import { isUserLoggedIn, setUserLoggedOut } from "./configs/auth";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (isUserLoggedIn()) {
        setUserLoggedOut();
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Provider store={store}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <GoogleOAuthProvider clientId="843638908791-6vkjd4qmcd3pdg355hq414c1f5b24cpc.apps.googleusercontent.com">
            <RouterProvider router={router} />
            <ToastContainer closeOnClick />
          </GoogleOAuthProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </Provider>
  );
}

export default App;
