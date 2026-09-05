import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <Button variant="outline" size="icon" aria-label="Toggle color theme" disabled><Sun /></Button>;

  const isDark = resolvedTheme === 'dark';
  return <Button variant="outline" size="icon" aria-label={isDark ? 'Use light theme' : 'Use dark theme'} onClick={() => setTheme(isDark ? 'light' : 'dark')}>{isDark ? <Sun /> : <Moon />}</Button>;
}
