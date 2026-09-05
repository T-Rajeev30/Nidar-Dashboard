const STATUS_LABELS = {
  todo: 'To do',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

function isInCurrentWeek(date, now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

export function createDashboardMetrics({ tasks = [], meetings = [], teams = [], now = new Date() }) {
  const activeTasks = tasks.filter((task) => task.status !== 'done');
  const overdue = activeTasks.filter((task) => task.dueDate && new Date(task.dueDate) < now);
  const currentWeekMeetings = meetings.filter((meeting) => isInCurrentWeek(new Date(meeting.scheduledAt), now));
  const memberIds = new Set(teams.flatMap((team) => (team.members || []).map((member) => member._id)));

  return {
    cards: [
      { label: 'Active tasks', value: activeTasks.length },
      { label: 'Overdue', value: overdue.length },
      { label: 'Meetings this week', value: currentWeekMeetings.length },
      { label: 'Team members', value: memberIds.size },
    ],
    statusData: Object.entries(STATUS_LABELS).map(([status, label]) => ({
      status: label,
      count: tasks.filter((task) => task.status === status).length,
    })),
  };
}
