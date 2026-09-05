import ProgressBar from './ProgressBar';
import DeadlineCountdown from './DeadlineCountdown';
import Link from 'next/link';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header({ member, overallProgress, deadline, onSignOut }) {
  const initials = member?.name?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'M';

  return <header className="app-header"><div><p className="eyebrow"><span aria-hidden="true" />NIDAR 2026–27 · TRACK 1</p><h1>AirMouse Ops Board</h1></div><div className="header-progress"><span>Mission progress</span><ProgressBar progress={overallProgress} /></div><DeadlineCountdown deadline={deadline} /><div className="member-menu"><div><Link href="/profile" className="member-profile-link"><strong>{member?.name}</strong></Link><span>{member?.team?.displayName}</span></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Open account menu"><Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{member?.name || 'Member'}<span className="block font-normal text-muted-foreground">{member?.team?.displayName || 'NIDAR member'}</span></DropdownMenuLabel><DropdownMenuSeparator />{member?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin/members"><ShieldCheck />Manage members</Link></DropdownMenuItem>}<DropdownMenuItem variant="destructive" onSelect={onSignOut}><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>;
}
