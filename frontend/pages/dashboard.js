import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { getMember, clearMember } from '../lib/session';
import { filterTasks } from '../lib/dashboard-utils.mjs';
import Header from '../components/Header';
import TeamColumn from '../components/TeamColumn';
import TaskToolbar from '../components/TaskToolbar';
import MeetingScheduler from '../components/MeetingScheduler';
import MeetingsList from '../components/MeetingsList';
import PlanUpload from '../components/PlanUpload';
import PlansList from '../components/PlansList';

export default function Dashboard() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tasksByTeam, setTasksByTeam] = useState({});
  const [meetings, setMeetings] = useState([]);
  const [plans, setPlans] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const loadAll = useCallback(async ({ refresh = false } = {}) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [teamsData, tasks, meetingsData, missionData, plansData] = await Promise.all([
        api.getTeams(), api.getTasks(), api.getMeetings(), api.getMission(), api.getPlans(),
      ]);
      const byTeam = {};
      tasks.forEach((task) => { (byTeam[task.team] ||= []).push(task); });
      setTeams(teamsData);
      setTasksByTeam(byTeam);
      setMeetings(meetingsData);
      setDeadline(missionData.deadline);
      setPlans(plansData);
      return byTeam;
    } catch (err) {
      setError(err.message || 'Unable to load the mission board. Try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const saved = getMember();
    if (!saved) { router.replace('/'); return; }
    setMember(saved);
    loadAll();
  }, [loadAll, router]);

  async function mutate(action, successMessage) {
    setFeedback('');
    try {
      await action();
      await loadAll({ refresh: true });
      setFeedback(successMessage);
      return true;
    } catch (err) {
      setError(err.message || 'That change could not be saved. Try again.');
      return false;
    }
  }

  async function handleAddTask(teamId, payload) {
    await mutate(() => api.createTask({ ...payload, team: teamId, createdBy: member?._id }), 'Task added.');
  }

  async function handleSeedModules() {
    const result = await api.seedModules();
    await loadAll({ refresh: true });
    return result;
  }

  const overallProgress = useMemo(() => {
    const all = Object.values(tasksByTeam).flat();
    const done = all.filter((task) => task.status === 'done').length;
    return { total: all.length, done, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [tasksByTeam]);

  if (loading) return <main className="loading-page" aria-busy="true"><div className="loading-card"><span className="skeleton-line" /><span className="skeleton-line short" /><span className="skeleton-grid" /></div><p>Loading mission board…</p></main>;

  return (
    <div className="app-shell">
      <Header member={member} overallProgress={overallProgress} deadline={deadline} onSignOut={() => { clearMember(); router.replace('/'); }} />
      <main className="dashboard-main">
        <div className="page-intro">
          <div><p className="eyebrow">OPERATIONS</p><h2>Team workboard</h2><p className="muted">Track work, unblock teammates, and keep the mission moving.</p></div>
          <TaskToolbar query={query} status={status} onQueryChange={setQuery} onStatusChange={setStatus} onRefresh={() => loadAll({ refresh: true })} refreshing={refreshing} />
        </div>
        {error && <div className="notice notice-error" role="alert"><span>{error}</span><button className="button button-secondary" onClick={() => loadAll({ refresh: true })}>Retry</button></div>}
        {feedback && <p className="notice notice-success" role="status" aria-live="polite">{feedback}</p>}
        <section className="team-grid" aria-label="Team tasks">
          {teams.map((team) => <TeamColumn key={team._id} team={team} tasks={filterTasks(tasksByTeam[team._id] || [], { query, status })}
            filtered={Boolean(query || status !== 'all')}
            onAddTask={(teamId, payload) => mutate(() => api.createTask({ ...payload, team: teamId, createdBy: member._id }), 'Task added.')}
            onUpdateTask={(taskId, updates) => mutate(() => api.updateTask(taskId, updates), 'Task updated.')}
            onDeleteTask={(taskId) => mutate(() => api.deleteTask(taskId), 'Task deleted.')}
            onSeedModules={handleSeedModules} />)}
        </section>
        <section className="dashboard-section" aria-labelledby="plans-heading"><div className="section-heading"><div><p className="eyebrow">ACCOUNTABILITY</p><h2 id="plans-heading">Plans and progress</h2></div></div><div className="detail-grid"><div className="surface"><h3>Post a team plan</h3><PlanUpload teams={teams} defaultTeamId={member?.team?._id} onUpload={(payload) => mutate(() => api.createPlan({ ...payload, createdBy: member._id }), 'Plan posted.')} /></div><div className="surface"><h3>Recent plans</h3><PlansList plans={plans} onDelete={(id) => mutate(() => api.deletePlan(id), 'Plan deleted.')} /></div></div></section>
        <section className="dashboard-section" aria-labelledby="meetings-heading"><div className="section-heading"><div><p className="eyebrow">COORDINATION</p><h2 id="meetings-heading">Meetings</h2></div></div><div className="detail-grid"><div className="surface"><h3>Schedule a meeting</h3><MeetingScheduler teams={teams} onSchedule={async (payload) => { const meeting = await api.createMeeting({ ...payload, organizerId: member._id }); await loadAll({ refresh: true }); return meeting; }} /></div><div className="surface"><h3>Schedule</h3><MeetingsList meetings={meetings} /></div></div></section>
      </main>
    </div>
  );
}
