import { useMemo, useState } from 'react';
import { Calendar } from './ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

function sameDay(left, right) {
  return left && right && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export default function MeetingAgenda({ meetings }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const meetingDates = useMemo(() => meetings.map((meeting) => new Date(meeting.scheduledAt)), [meetings]);
  const dayMeetings = meetings.filter((meeting) => sameDay(new Date(meeting.scheduledAt), selectedDate)).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return <div className="meeting-agenda-grid">
    <Card><CardHeader><CardTitle>Calendar</CardTitle></CardHeader><CardContent><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} modifiers={{ hasMeeting: meetingDates }} modifiersClassNames={{ hasMeeting: 'calendar-has-meeting' }} /></CardContent></Card>
    <Card><CardHeader><CardTitle>Agenda for {selectedDate.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</CardTitle></CardHeader><CardContent>
      {dayMeetings.length === 0 ? <div className="empty-state-action"><p className="muted">No meetings are scheduled for this day.</p><Button asChild size="sm"><a href="#schedule-meeting">Schedule a meeting</a></Button></div> : <ul className="agenda-list">{dayMeetings.map((meeting) => <li key={meeting._id}><strong>{meeting.title}</strong><span>{new Date(meeting.scheduledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>{meeting.agenda && <p>{meeting.agenda}</p>}</li>)}</ul>}
    </CardContent></Card>
  </div>;
}
