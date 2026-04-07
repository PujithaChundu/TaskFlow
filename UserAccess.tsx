import { useState, useEffect, useRef } from "react";
import { getUsers, saveUsers, getDepartments, generateId, User, Role } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

const BLANK_FORM = (deptName: string) => ({
  name: "",
  username: "",
  password: "",
  email: "",
  role: "employee" as Role,
  department: deptName,
});

export default function UserAccess() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const departments = getDepartments();
  const defaultDept = departments[0]?.name || "";

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM(defaultDept));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Use a ref so handleSubmit always reads the current editUser value,
  // avoiding stale-closure bugs when switching between Edit and Add User.
  const editUserRef = useRef<User | null>(null);
  const [editUserDisplay, setEditUserDisplay] = useState<User | null>(null);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  function refresh() {
    setUsers(getUsers());
  }

  function openCreate() {
    editUserRef.current = null;
    setEditUserDisplay(null);
    setForm(BLANK_FORM(defaultDept));
    setError("");
    setSaved(false);
    setShowForm(true);
  }

  function openEdit(u: User) {
    editUserRef.current = u;
    setEditUserDisplay(u);
    setForm({
      name: u.name,
      username: u.username,
      password: u.password,
      email: u.email,
      role: u.role,
      department: u.department,
    });
    setError("");
    setSaved(false);
    setShowForm(true);
  }

  function closeForm() {
    editUserRef.current = null;
    setEditUserDisplay(null);
    setError("");
    setSaved(false);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedUsername = form.username.trim();
    const trimmedName = form.name.trim();
    const trimmedPassword = form.password.trim();

    if (!trimmedName || !trimmedUsername || !trimmedPassword) {
      setError("Name, username, and password are required.");
      return;
    }

    const all = getUsers();
    const currentEditId = editUserRef.current?.id ?? null;

    // Check for duplicate username — exclude the user being edited
    const duplicate = all.find(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.id !== currentEditId
    );
    if (duplicate) {
      setError(`Username "${trimmedUsername}" is already taken. Please choose a different username.`);
      return;
    }

    const updatedForm = { ...form, name: trimmedName, username: trimmedUsername, password: trimmedPassword };

    if (currentEditId) {
      const idx = all.findIndex((u) => u.id === currentEditId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...updatedForm };
      }
    } else {
      all.push({
        id: generateId(),
        ...updatedForm,
        createdAt: new Date().toISOString(),
      });
    }

    saveUsers(all);
    refresh();
    setSaved(true);
    setTimeout(() => {
      closeForm();
    }, 1200);
  }

  function deleteUser(id: string) {
    if (id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;
    const all = getUsers().filter((u) => u.id !== id);
    saveUsers(all);
    refresh();
  }

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-purple-100 text-purple-700",
    employee: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Access</h2>
          <p className="text-gray-500 text-sm">
            {users.length} user{users.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editUserDisplay ? "Edit User" : "Create New User"}
              </h3>
              <button
                onClick={closeForm}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="john.doe"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="password"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="john@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-sm">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-xl text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  User {editUserDisplay ? "updated" : "created"} successfully!
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saved}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl transition"
                >
                  {editUserDisplay ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600 font-mono">{u.username}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{u.department}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
