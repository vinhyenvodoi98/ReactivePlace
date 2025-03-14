import * as React from 'react';

import Wallet from '../Wallet';

export default function Header() {
  return (
    <header className='sticky top-0 z-50 bg-white'>
      <div className='layout flex h-20 items-center justify-between'>
        <strong className='text-lg'>Super/Place</strong>
        <div className='flex'>
          <Wallet />
        </div>
      </div>
    </header>
  );
}
