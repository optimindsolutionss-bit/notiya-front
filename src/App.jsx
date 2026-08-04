import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NegocioProvider } from "./context/NegocioContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NegocioProvider>
          <AppRouter />
        </NegocioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
