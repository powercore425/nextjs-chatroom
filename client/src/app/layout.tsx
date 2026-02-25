import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Chat Rooms',
  description: 'Real-time chat',
};

const themeScript = `(function(){
  var k='chat-theme';
  try {
    var s=localStorage.getItem(k);
    var dark=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme:dark)').matches);
    var html=document.documentElement;
    if(dark){ html.classList.add('dark'); html.setAttribute('data-theme','dark'); }
    else{ html.classList.remove('dark'); html.setAttribute('data-theme','light'); }
  } catch(e){}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
