export function applyTaskUpdate(tasksByTeam, taskId, updates, teams) {
  return Object.fromEntries(Object.entries(tasksByTeam).map(([teamId, tasks]) => [teamId, tasks.map((task) => {
    if (task._id !== taskId) return task;
    const team = teams.find((candidate) => candidate._id === teamId);
    const assignee = Object.prototype.hasOwnProperty.call(updates, 'assignee')
      ? updates.assignee ? team?.members?.find((member) => member._id === updates.assignee) || updates.assignee : null
      : task.assignee;
    return { ...task, ...updates, assignee };
  })]));
}
