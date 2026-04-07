import { useState, useMemo } from "react";
import { getTasks, saveTasks, getUsers, Task, TaskStatus } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { exportToCSV, exportToPDF, exportToWord } from "@/lib/export";

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; cls: string }> = {
    todo: { label: "To Do", cls: "bg-gray-100 text-gray-600" },
    inprogress: { label: "In Progress", cls: "bg-amber-100 text-amber-700" },
    done: { label: "Done", cls: "bg-green-100 text-green-700" },
  };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status].cls}`}>{map[status].label}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "bg-blue-100 text-blue-600",
    medium: "bg-orange-100 text-orange-600",
    high: "bg-red-100 text-red-600",
  };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[priority]}`}>{priority}</span>;
}

export default function Tasks({ onEdit }: { onEdit: (task: Task) => void }) {
  const { user, isAdmin, isManager, isEmployee } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const allTasks = getTasks();
  const users = getUsers();

  const tasks = useMemo(() => {
    let t = isEmployee ? allTasks.filter((task) => task.assignedTo === user?.id) : allTasks;
    if (statusFilter !== "all") t = t.filter((task) => task.status === statusFilter);
    if (priorityFilter !== "all") t = t.filter((task) => task.priority === priorityFilter);
    if (search) t = t.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase()));
    return t.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [allTasks, user, isEmployee, statusFilter, priorityFilter, search]);

  function updateStatus(id: string, newStatus: TaskStatus) {
    const all = getTasks();
    const idx = all.findIndex((t) => t.id === id);
    if (idx >= 0) {
      all[idx].status = newStatus;
      all[idx].updatedAt = new Date().toISOString();
      saveTasks(all);
      window.dispatchEvent(new Event("tasks-updated"));
    }
  }

  function deleteTask(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    saveTasks(getTasks().filter((t) => t.id !== id));
    window.dispatchEvent(new Event("tasks-updated"));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{isEmployee ? "My Tasks" : "All Tasks"}</h2>
          <p className="text-gray-500 text-sm">{tasks.length} task{tasks.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-40">
              <button onClick={() => { exportToCSV(tasks, users); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <span className="text-green-600 font-bold text-xs">CSV</span> Export to Excel
              </button>
              <button onClick={() => { exportToPDF(tasks, users); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <span className="text-red-600 font-bold text-xs">PDF</span> Export to PDF
              </button>
              <button onClick={() => { exportToWord(tasks, users); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <span className="text-blue-600 font-bold text-xs">DOC</span> Export to Word
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 font-medium">No tasks found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  {(isAdmin || isManager) && <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>}
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assignedTo);
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";
                  return (
                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800 text-sm">{task.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{task.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{task.department}</div>
                      </td>
                      <td className="px-4 py-4"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-4 py-4">
                        {isEmployee ? (
                          <select
                            value={task.status}
                            onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <StatusBadge status={task.status} />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${isOverdue ? "text-red-500 font-medium" : "text-gray-600"}`}>{task.dueDate}</span>
                        {isOverdue && <span className="ml-1 text-xs text-red-400">(overdue)</span>}
                      </td>
                      {(isAdmin || isManager) && (
                        <td className="px-4 py-4">
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{assignee.name.charAt(0)}</div>
                              <span className="text-sm text-gray-600">{assignee.name}</span>
                            </div>
                          ) : <span className="text-sm text-gray-400">Unassigned</span>}
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {(isAdmin || isManager) && (
                            <>
                              <button onClick={() => onEdit(task)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => deleteTask(task.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
