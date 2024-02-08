export const getColor = (status: string) => {
  if (status === "backlog") return "default";
  if (status === "todo") return "secondary";
  if (status === "in_progress") return "primary";
  if (status === "in_review") return "warning";
  if (status === "done") return "success";
};

export const getStatus = (status: string) => {
  if (status === "backlog") return "Backlog📁";
  if (status === "todo") return "To Do📝";
  if (status === "in_progress") return "In Progress🔨";
  if (status === "in_review") return "In Review👀";
  if (status === "done") return "Done✅";
};
