import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Presenter from "./pages/Presenter";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Presenter could be separate from shell to maximize space, but shell provides logout/nav. 
              Let's keep it in shell or use separate layout.
              Presenter page uses full height. AppShell has margins.
              I'll just put Presenter OUTSIDE AppShell or conditional?
              The request says "Top AppBar" in requirements. AppShell has AppBar.
              So I'll put it in AppShell, but might need to adjust Container margins in Presenter page.
              Actually, Presenter page implementation currently handles full layout logic relative to its container.
              If wrapped in AppShell Container, it will have constraints.
              I will render Presenter WITHOUT AppShell to allow full screen custom layout, 
              as Presenter component already includes an AppBar-like top bar.
          */}
        </Route>
        <Route path="/presenter/:joinCode" element={<Presenter />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
