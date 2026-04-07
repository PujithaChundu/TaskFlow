import { useMemo } from "react";
import { getTasks, getUsers, Task } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function TaskCard({ task, users }: { task: Task; users: ReturnType<typeof getUsers> }) {
  const assignee = users.find((u) => u.id === task.assignedTo);
  const statusBadge: Record<string, string> = {
    todo: "bg-gray-100 text-gray-600",
    inprogress: "bg-amber-100 text-amber-700",
    done: "bg-green-100 text-green-700",
  };
  const statusLabel: Record<string, string> = {
    todo: "To Do",
    inprogress: "In Progress",
    done: "Done",
  };
  const priorityBadge: Record<string, string> = {
    low: "bg-blue-100 text-blue-600",
    medium: "bg-orange-100 text-orange-600",
    high: "bg-red-100 text-red-600",
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 pr-2">{task.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${priorityBadge[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[task.status]}`}>
          {statusLabel[task.status]}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className={`w-3.5 h-3.5 ${isOverdue ? "text-red-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={isOverdue ? "text-red-500 font-medium" : ""}>{task.dueDate}</span>
        </div>
      </div>
      {assignee && (
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1.5">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {assignee.name.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{assignee.name}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();

  const allTasks = getTasks();
  const users = getUsers();

  const tasks = useMemo(() => {
    if (isAdmin || isManager) return allTasks;
    return allTasks.filter((t) => t.assignedTo === user?.id);
  }, [allTasks, user, isAdmin, isManager]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length,
  }), [tasks]);

  const pieData = [
    { name: "To Do", value: stats.todo, color: "#6b7280" },
    { name: "In Progress", value: stats.inprogress, color: "#f59e0b" },
    { name: "Done", value: stats.done, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: "Low", count: tasks.filter((t) => t.priority === "low").length, fill: "#3b82f6" },
    { name: "Medium", count: tasks.filter((t) => t.priority === "medium").length, fill: "#f59e0b" },
    { name: "High", count: tasks.filter((t) => t.priority === "high").length, fill: "#ef4444" },
  ];

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} color="bg-blue-500" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <StatCard label="To Do" value={stats.todo} color="bg-gray-500" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <StatCard label="In Progress" value={stats.inprogress} color="bg-amber-500" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Done" value={stats.done} color="bg-emerald-500" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 text-sm font-medium">You have {stats.overdue} overdue task{stats.overdue > 1 ? "s" : ""}. Please review and update them.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Task Status Overview</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No tasks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Recent Tasks</h3>
        {recentTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-medium text-gray-500">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} users={users} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
