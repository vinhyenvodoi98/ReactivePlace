import * as React from 'react';

import DraggableBox from '@/components/drag';
import Layout from '@/components/layout/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className='flex relative justify-center items-center remaining-height bg-gray-200'>
        <DraggableBox />
      </div>
    </Layout>
  );
}
