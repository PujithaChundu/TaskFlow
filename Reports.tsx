import { useMemo } from "react";
import { getTasks, getUsers } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { exportToCSV, exportToPDF, exportToWord } from "@/lib/export";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default function Reports() {
  const tasks = getTasks();
  const users = getUsers();

  const departmentData = useMemo(() => {
    const map: Record<string, { todo: number; inprogress: number; done: number }> = {};
    tasks.forEach((t) => {
      if (!map[t.department]) map[t.department] = { todo: 0, inprogress: 0, done: 0 };
      if (t.status === "todo") map[t.department].todo++;
      else if (t.status === "inprogress") map[t.department].inprogress++;
      else map[t.department].done++;
    });
    return Object.entries(map).map(([name, vals]) => ({ name, ...vals }));
  }, [tasks]);

  const userTaskData = useMemo(() => {
    return users
      .filter((u) => u.role !== "admin")
      .map((u) => {
        const userTasks = tasks.filter((t) => t.assignedTo === u.id);
        return {
          name: u.name.split(" ")[0],
          total: userTasks.length,
          done: userTasks.filter((t) => t.status === "done").length,
          pending: userTasks.filter((t) => t.status !== "done").length,
        };
      })
      .filter((d) => d.total > 0);
  }, [tasks, users]);

  const completionTrend = useMemo(() => {
    const months: Record<string, { month: string; created: number; completed: number }> = {};
    tasks.forEach((t) => {
      const month = new Date(t.createdAt).toLocaleString("default", { month: "short", year: "numeric" });
      if (!months[month]) months[month] = { month, created: 0, completed: 0 };
      months[month].created++;
      if (t.status === "done") months[month].completed++;
    });
    return Object.values(months).slice(-6);
  }, [tasks]);

  const statusPie = [
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "inprogress").length },
    { name: "Done", value: tasks.filter((t) => t.status === "done").length },
  ].filter((d) => d.value > 0);

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500 text-sm">Overview of task performance and team progress</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(tasks, users)} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(tasks, users)} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            PDF
          </button>
          <button onClick={() => exportToWord(tasks, users)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Word
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, color: "text-blue-600 bg-blue-50" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "text-green-600 bg-green-50" },
          { label: "Overdue Tasks", value: overdueCount, color: "text-red-600 bg-red-50" },
          { label: "Active Users", value: users.filter((u) => u.role !== "admin").length, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Tasks by Department</h3>
          {departmentData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="todo" name="To Do" fill="#6b7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inprogress" name="In Progress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="done" name="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Status Distribution</h3>
          {statusPie.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {completionTrend.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" name="Created" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {userTaskData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Tasks per Team Member</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={userTaskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="done" name="Done" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
