import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { router } from "./Routes";
import { store } from "./redux/store";
import "./api/apiClient";

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!;

function App() {
  return (
    <Provider store={store}>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <GoogleOAuthProvider clientId={googleClientId}>
            <RouterProvider router={router} />
            <ToastContainer closeOnClick />
          </GoogleOAuthProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </Provider>
  );
}

export default App;
