export type Role = "admin" | "manager" | "employee";
export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
  email: string;
  department: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  department: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

const USERS_KEY = "tms_users";
const TASKS_KEY = "tms_tasks";
const DEPARTMENTS_KEY = "tms_departments";
const SESSION_KEY = "tms_session";

const defaultDepartments: Department[] = [
  { id: "dept-1", name: "Engineering", description: "Software development and technical operations" },
  { id: "dept-2", name: "Marketing", description: "Marketing and brand management" },
  { id: "dept-3", name: "Sales", description: "Sales and customer relations" },
  { id: "dept-4", name: "HR", description: "Human resources and people operations" },
];

const defaultUsers: User[] = [
  {
    id: "user-admin",
    username: "admin",
    password: "admin123",
    role: "admin",
    name: "System Administrator",
    email: "admin@company.com",
    department: "Engineering",
    createdAt: new Date().toISOString(),
  },
];

export function initStorage() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(DEPARTMENTS_KEY)) {
    localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(defaultDepartments));
  }
}

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getTasks(): Task[] {
  return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getDepartments(): Department[] {
  return JSON.parse(localStorage.getItem(DEPARTMENTS_KEY) || "[]");
}

export function saveDepartments(departments: Department[]) {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departments));
}

export function getSession(): User | null {
  const s = sessionStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

export function setSession(user: User) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function authenticate(username: string, password: string): User | null {
  const users = getUsers();
  return users.find((u) => u.username === username && u.password === password) || null;
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
