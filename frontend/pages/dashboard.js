import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { getMember, clearMember } from '../lib/session';
import Header from '../components/Header';
import TeamColumn from '../components/TeamColumn';
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
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const teamsData = await api.getTeams();
      setTeams(teamsData);

      const taskLists = await Promise.all(
        teamsData.map((t) => api.getTasks(t._id))
      );
      const map = {};
      teamsData.forEach((t, i) => { map[t._id] = taskLists[i]; });
      setTasksByTeam(map);

      const [meetingsData, missionData, plansData] = await Promise.all([
        api.getMeetings(),
        api.getMission(),
        api.getPlans(),
      ]);
      setMeetings(meetingsData);
      setDeadline(missionData.deadline);
      setPlans(plansData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const m = getMember();
    if (!m) {
      router.replace('/');
      return;
    }
    setMember(m);
    loadAll();
  }, [loadAll, router]);

  async function handleAddTask(teamId, payload) {
    await api.createTask({ ...payload, team: teamId, createdBy: member._id });
    loadAll();
  }

  async function handleUpdateTask(taskId, updates) {
    await api.updateTask(taskId, updates);
    loadAll();
  }

  async function handleDeleteTask(taskId) {
    await api.deleteTask(taskId);
    loadAll();
  }

  async function handleScheduleMeeting(payload) {
    const meeting = await api.createMeeting({ ...payload, organizerId: member._id });
    await loadAll();
    return meeting;
  }

  async function handleUploadPlan(payload) {
    await api.createPlan({ ...payload, createdBy: member._id });
    await loadAll();
  }

  async function handleDeletePlan(planId) {
    await api.deletePlan(planId);
    loadAll();
  }

  function handleSignOut() {
    clearMember();
    router.replace('/');
  }

  const overallProgress = (() => {
    const allTasks = Object.values(tasksByTeam).flat();
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.status === 'done').length;
    return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
  })();

  if (loading) {
    return <div style={styles.centered}>Loading mission board…</div>;
  }

  return (
    <div>
      <Header member={member} overallProgress={overallProgress} deadline={deadline} onSignOut={handleSignOut} />

      {error && <p style={styles.error}>{error}</p>}

      <main style={styles.grid}>
        {teams.map((team) => (
          <TeamColumn
            key={team._id}
            team={team}
            tasks={tasksByTeam[team._id] || []}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </main>

      <section style={styles.section}>
        <div style={styles.sectionGrid}>
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>Upload a team plan</h2>
            <PlanUpload teams={teams} defaultTeamId={member?.team?._id} onUpload={handleUploadPlan} />
          </div>
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>Team plans & progress</h2>
            <PlansList plans={plans} onDelete={handleDeletePlan} />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionGrid}>
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>Schedule a meeting</h2>
            <MeetingScheduler teams={teams} onSchedule={handleScheduleMeeting} />
          </div>
          <div style={styles.panel}>
            <h2 style={styles.sectionTitle}>Upcoming & past meetings</h2>
            <MeetingsList meetings={meetings} />
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 18,
    padding: 24,
  },
  error: { color: 'var(--status-blocked)', padding: '0 24px', fontSize: 13 },
  section: { padding: '0 24px 40px' },
  sectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 },
  panel: {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: 18,
  },
  sectionTitle: { margin: '0 0 14px', fontSize: 16, fontWeight: 600 },
};