import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import AddTask from "@/pages/AddTask";
import Reports from "@/pages/Reports";
import Departments from "@/pages/Departments";
import Tracking from "@/pages/Tracking";
import UserAccess from "@/pages/UserAccess";
import { Task } from "@/lib/storage";

type Page = "dashboard" | "tasks" | "addtask" | "reports" | "departments" | "tracking" | "useraccess";

function AppContent() {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    window.addEventListener("tasks-updated", handler);
    return () => window.removeEventListener("tasks-updated", handler);
  }, []);

  if (!user) return <Login />;

  function handleEditTask(task: Task) {
    setEditTask(task);
    setPage("addtask");
  }

  function handleTaskSaved() {
    setEditTask(null);
    setPage("tasks");
  }

  function handlePageChange(p: Page) {
    if (p !== "addtask") setEditTask(null);
    setPage(p);
  }

  function renderPage() {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "tasks": return <Tasks onEdit={handleEditTask} />;
      case "addtask":
        if (isEmployee) return <Tasks onEdit={handleEditTask} />;
        return <AddTask editTask={editTask} onSaved={handleTaskSaved} />;
      case "reports":
        if (isEmployee) return <Dashboard />;
        return <Reports />;
      case "departments":
        if (isEmployee) return <Dashboard />;
        return <Departments />;
      case "tracking":
        if (isEmployee) return <Dashboard />;
        return <Tracking />;
      case "useraccess":
        if (!isAdmin) return <Dashboard />;
        return <UserAccess />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar current={page} onChange={handlePageChange} />
      <main className="flex-1 overflow-auto">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
