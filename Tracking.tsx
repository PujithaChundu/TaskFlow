import { useMemo } from "react";
import { getTasks, getUsers } from "@/lib/storage";

export default function Tracking() {
  const tasks = getTasks();
  const users = getUsers();

  const overdue = useMemo(() =>
    tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [tasks]
  );

  const upcoming = useMemo(() => {
    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks
      .filter((t) => new Date(t.dueDate) >= now && new Date(t.dueDate) <= next7 && t.status !== "done")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  const inProgress = useMemo(() =>
    tasks.filter((t) => t.status === "inprogress")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [tasks]
  );

  function TaskRow({ task, type }: { task: (typeof tasks)[0]; type: "overdue" | "upcoming" | "active" }) {
    const assignee = users.find((u) => u.id === task.assignedTo);
    const priorityColor: Record<string, string> = {
      low: "bg-blue-100 text-blue-600",
      medium: "bg-orange-100 text-orange-600",
      high: "bg-red-100 text-red-600",
    };
    const dayDiff = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-gray-800 text-sm">{task.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>{task.priority}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{task.department}</span>
            {assignee && <span>· {assignee.name}</span>}
          </div>
        </div>
        <div className="text-right ml-4">
          <div className={`text-sm font-semibold ${type === "overdue" ? "text-red-600" : type === "upcoming" ? "text-amber-600" : "text-blue-600"}`}>
            {type === "overdue" ? `${Math.abs(dayDiff)}d overdue` : type === "upcoming" ? `${dayDiff}d left` : task.dueDate}
          </div>
          <div className="text-xs text-gray-400">{task.dueDate}</div>
        </div>
      </div>
    );
  }

  function Section({ title, tasks: list, type, color }: { title: string; tasks: typeof tasks; type: "overdue" | "upcoming" | "active"; color: string }) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`px-5 py-4 border-b border-gray-100 flex items-center gap-3 ${color}`}>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70">{list.length}</span>
        </div>
        {list.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No tasks in this category</div>
        ) : (
          list.map((task) => <TaskRow key={task.id} task={task} type={type} />)
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Task Tracking</h2>
        <p className="text-gray-500 text-sm">Monitor task deadlines and progress in real time</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Overdue", value: overdue.length, color: "text-red-600 bg-red-50" },
          { label: "Due This Week", value: upcoming.length, color: "text-amber-600 bg-amber-50" },
          { label: "In Progress", value: inProgress.length, color: "text-blue-600 bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className={`text-3xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Section title="Overdue Tasks" tasks={overdue} type="overdue" color="bg-red-50" />
      <Section title="Due This Week" tasks={upcoming} type="upcoming" color="bg-amber-50" />
      <Section title="Currently In Progress" tasks={inProgress} type="active" color="bg-blue-50" />
    </div>
  );
}
