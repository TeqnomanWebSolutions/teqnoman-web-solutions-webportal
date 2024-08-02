import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/template.css'
import '@/styles/globals.scss';
import { SessionProvider } from 'next-auth/react';
import GlobalToastContainer from '@/components/GlobalToastContainer/GlobalToastContainer';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={pageProps.session}>
      <GlobalToastContainer />
      <Component {...pageProps} />
    </SessionProvider>
  );
}