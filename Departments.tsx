import { useState, useEffect } from "react";
import { getDepartments, saveDepartments, getTasks, getUsers, Department, generateId } from "@/lib/storage";

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const tasks = getTasks();
  const users = getUsers();

  useEffect(() => {
    setDepartments(getDepartments());
  }, []);

  function openCreate() {
    setEditDept(null);
    setForm({ name: "", description: "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(d: Department) {
    setEditDept(d);
    setForm({ name: d.name, description: d.description });
    setError("");
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    const all = getDepartments();
    const dup = all.find((d) => d.name.toLowerCase() === form.name.toLowerCase() && d.id !== editDept?.id);
    if (dup) { setError("Department name already exists."); return; }

    if (editDept) {
      const idx = all.findIndex((d) => d.id === editDept.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...form };
    } else {
      all.push({ id: generateId(), ...form });
    }

    saveDepartments(all);
    setDepartments(all);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 1000);
  }

  function deleteDept(id: string) {
    if (!confirm("Delete this department?")) return;
    const all = getDepartments().filter((d) => d.id !== id);
    saveDepartments(all);
    setDepartments(all);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500 text-sm">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Department
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editDept ? "Edit Department" : "Add Department"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Engineering" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Department description..." />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {saved && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">Saved!</p>}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition">{editDept ? "Update" : "Create"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deptTasks = tasks.filter((t) => t.department === dept.name);
          const deptUsers = users.filter((u) => u.department === dept.name);
          return (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{dept.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => deleteDept(dept.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-700">{deptTasks.length}</p>
                  <p className="text-xs text-blue-500">Tasks</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{deptUsers.length}</p>
                  <p className="text-xs text-purple-500">Members</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{deptTasks.filter((t) => t.status === "todo").length} to do</span>
                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">{deptTasks.filter((t) => t.status === "inprogress").length} in progress</span>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">{deptTasks.filter((t) => t.status === "done").length} done</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
