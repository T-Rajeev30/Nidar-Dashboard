import Link from 'next/link';
import ProgressBar from './ProgressBar';
import DeadlineCountdown from './DeadlineCountdown';

export default function Header({ member, overallProgress, deadline, onSignOut }) {
  return <header className="app-header"><div><p className="eyebrow"><span aria-hidden="true" />NIDAR 2026–27 · TRACK 1</p><h1>AirMouse Ops Board</h1></div><div className="header-progress"><span>Mission progress</span><ProgressBar progress={overallProgress} /></div><DeadlineCountdown deadline={deadline} /><div className="member-menu"><div><Link href="/profile" className="member-profile-link"><strong>{member?.name}</strong></Link><span>{member?.team?.displayName}</span></div><button className="button button-secondary" onClick={onSignOut}>Sign out</button></div></header>;
}
