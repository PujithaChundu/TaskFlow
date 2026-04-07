import { getUsers, getTasks, saveUsers, saveTasks, User, Task, generateId } from "./storage";

export function seedDemoData() {
  const users = getUsers();

  if (users.length > 1) return;

  const demoUsers: User[] = [
    { id: "user-mgr1", username: "alice", password: "alice123", role: "manager", name: "Alice Johnson", email: "alice@company.com", department: "Engineering", createdAt: new Date().toISOString() },
    { id: "user-emp1", username: "bob", password: "bob123", role: "employee", name: "Bob Smith", email: "bob@company.com", department: "Engineering", createdAt: new Date().toISOString() },
    { id: "user-emp2", username: "carol", password: "carol123", role: "employee", name: "Carol Davis", email: "carol@company.com", department: "Marketing", createdAt: new Date().toISOString() },
    { id: "user-emp3", username: "david", password: "david123", role: "employee", name: "David Lee", email: "david@company.com", department: "Sales", createdAt: new Date().toISOString() },
    { id: "user-mgr2", username: "emma", password: "emma123", role: "manager", name: "Emma Wilson", email: "emma@company.com", department: "Marketing", createdAt: new Date().toISOString() },
  ];

  saveUsers([...users, ...demoUsers]);

  const now = new Date();
  const past = (d: number) => new Date(now.getTime() - d * 86400000).toISOString().split("T")[0];
  const future = (d: number) => new Date(now.getTime() + d * 86400000).toISOString().split("T")[0];

  const tasks: Task[] = [
    { id: generateId(), title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated deployment and testing", priority: "high", status: "done", dueDate: past(5), assignedTo: "user-emp1", createdBy: "user-mgr1", department: "Engineering", createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Design new landing page", description: "Create mockups and implement the redesigned landing page for Q2", priority: "high", status: "inprogress", dueDate: future(3), assignedTo: "user-emp2", createdBy: "user-mgr2", department: "Marketing", createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Prepare quarterly sales report", description: "Compile Q1 sales data and prepare the executive summary presentation", priority: "medium", status: "todo", dueDate: future(7), assignedTo: "user-emp3", createdBy: "user-admin", department: "Sales", createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Fix authentication bug", description: "Investigate and resolve the session timeout issue reported by users", priority: "high", status: "inprogress", dueDate: past(1), assignedTo: "user-emp1", createdBy: "user-mgr1", department: "Engineering", createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Social media campaign setup", description: "Launch Q2 social media campaign across Twitter, LinkedIn, and Instagram", priority: "medium", status: "todo", dueDate: future(14), assignedTo: "user-emp2", createdBy: "user-mgr2", department: "Marketing", createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Database optimization", description: "Review and optimize slow-running queries, add missing indexes", priority: "medium", status: "todo", dueDate: future(10), assignedTo: "user-emp1", createdBy: "user-mgr1", department: "Engineering", createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Customer onboarding docs", description: "Write comprehensive onboarding documentation for new enterprise clients", priority: "low", status: "done", dueDate: past(3), assignedTo: "user-emp3", createdBy: "user-admin", department: "Sales", createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), title: "Code review: payment module", description: "Review and approve pull requests for the new payment processing module", priority: "high", status: "todo", dueDate: future(2), assignedTo: "user-mgr1", createdBy: "user-admin", department: "Engineering", createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(), updatedAt: new Date().toISOString() },
  ];

  saveTasks(tasks);
}
