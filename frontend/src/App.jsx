import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Audiences from "./pages/Audiences";
import Campaigns from "./pages/Campaigns";
import Translations from "./pages/Translations";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";

function ProtectedLayout() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Protected Application */}
        <Route element={<ProtectedLayout />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Audiences */}
          <Route
            path="/audiences"
            element={<Audiences />}
          />

          {/* Campaigns */}
          <Route
            path="/campaigns"
            element={<Campaigns />}
          />

          {/* AI Translation */}
          <Route
            path="/translations"
            element={<Translations />}
          />

          {/* Messages & Delivery */}
          <Route
            path="/messages"
            element={<Messages />}
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />

        </Route>

        {/* Invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;