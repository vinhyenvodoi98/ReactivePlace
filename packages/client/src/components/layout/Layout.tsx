import * as React from 'react';

import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Put Header or Footer Here
  return (
    <div className='px-8 min-h-screen'>
      <Header />
      <div className='remaining-height'>{children}</div>
    </div>
  );
}
