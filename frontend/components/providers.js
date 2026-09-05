import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
