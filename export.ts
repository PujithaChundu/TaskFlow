import { Task, User } from "./storage";

function getStatusLabel(status: string) {
  return status === "todo" ? "To Do" : status === "inprogress" ? "In Progress" : "Done";
}

function getPriorityLabel(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function exportToCSV(tasks: Task[], users: User[]) {
  const headers = ["Title", "Description", "Priority", "Status", "Due Date", "Assigned To", "Department", "Created At"];
  const rows = tasks.map((t) => {
    const assignee = users.find((u) => u.id === t.assignedTo);
    return [
      `"${t.title}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      getPriorityLabel(t.priority),
      getStatusLabel(t.status),
      t.dueDate,
      assignee ? assignee.name : "Unassigned",
      t.department,
      new Date(t.createdAt).toLocaleDateString(),
    ];
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(tasks: Task[], users: User[]) {
  const now = new Date().toLocaleDateString();
  const rows = tasks
    .map((t) => {
      const assignee = users.find((u) => u.id === t.assignedTo);
      const statusColor =
        t.status === "done" ? "#16a34a" : t.status === "inprogress" ? "#d97706" : "#6b7280";
      const priorityColor =
        t.priority === "high" ? "#dc2626" : t.priority === "medium" ? "#d97706" : "#16a34a";
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px 12px; font-weight: 500;">${t.title}</td>
          <td style="padding: 8px 12px; color: ${priorityColor}; font-weight: 600;">${getPriorityLabel(t.priority)}</td>
          <td style="padding: 8px 12px; color: ${statusColor}; font-weight: 600;">${getStatusLabel(t.status)}</td>
          <td style="padding: 8px 12px;">${t.dueDate}</td>
          <td style="padding: 8px 12px;">${assignee ? assignee.name : "Unassigned"}</td>
          <td style="padding: 8px 12px;">${t.department}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <html>
    <head>
      <title>Task Report - ${now}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
        h1 { color: #1e40af; font-size: 24px; margin-bottom: 4px; }
        p { color: #6b7280; margin: 0 0 24px; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #1e40af; color: white; }
        th { padding: 10px 12px; text-align: left; font-size: 13px; }
        td { font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
      </style>
    </head>
    <body>
      <h1>Task Management Report</h1>
      <p>Generated on ${now} &nbsp;|&nbsp; Total Tasks: ${tasks.length}</p>
      <table>
        <thead><tr>
          <th>Title</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Assigned To</th><th>Department</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

export function exportToWord(tasks: Task[], users: User[]) {
  const now = new Date().toLocaleDateString();
  const rows = tasks
    .map((t) => {
      const assignee = users.find((u) => u.id === t.assignedTo);
      return `
        <tr>
          <td>${t.title}</td>
          <td>${getPriorityLabel(t.priority)}</td>
          <td>${getStatusLabel(t.status)}</td>
          <td>${t.dueDate}</td>
          <td>${assignee ? assignee.name : "Unassigned"}</td>
          <td>${t.department}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
    <head>
      <meta charset="UTF-8">
      <title>Task Report</title>
      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #1e40af; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 12px; }
        th { background: #dbeafe; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Task Management Report</h1>
      <p>Generated: ${now} | Total: ${tasks.length} tasks</p>
      <table>
        <thead><tr>
          <th>Title</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Assigned To</th><th>Department</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks-${new Date().toISOString().split("T")[0]}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
