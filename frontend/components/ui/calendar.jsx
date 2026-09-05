import { DayPicker } from 'react-day-picker';
import { cn } from 'cn';

export function Calendar({ className, classNames, ...props }) {
  return <DayPicker className={cn('calendar', className)} classNames={{
    months: 'calendar-months', month: 'calendar-month', month_caption: 'calendar-caption', caption_label: 'calendar-caption-label', nav: 'calendar-nav', button_previous: 'calendar-nav-button', button_next: 'calendar-nav-button', month_grid: 'calendar-grid', weekdays: 'calendar-weekdays', weekday: 'calendar-weekday', week: 'calendar-week', day: 'calendar-day', day_button: 'calendar-day-button', selected: 'calendar-selected', today: 'calendar-today', outside: 'calendar-outside', disabled: 'calendar-disabled', hidden: 'calendar-hidden', ...classNames,
  }} {...props} />;
}
