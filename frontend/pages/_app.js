import '../styles/globals.css';
import Providers from '../components/providers';
import { Toaster } from '../components/ui/sonner';

export default function App({ Component, pageProps }) {
  return (
    <Providers>
      <Component {...pageProps} />
      <Toaster position="top-right" richColors closeButton />
    </Providers>
  );
}
