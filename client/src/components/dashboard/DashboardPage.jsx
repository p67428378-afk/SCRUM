import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-headline-lg font-headline-lg text-on-surface'>Dashboard Overview</h1>
          <p className='text-body-md font-body-md text-on-surface-variant mt-xs'>Real-time statistics and recent library transactions.</p>
        </div>
        <button className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all flex items-center gap-sm'>
          <span className='material-symbols-outlined' data-icon='add'>add</span>
          New Book Entry
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-lg'>
        {/* Stat Cards */}
        <div className='bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-label-md font-label-md text-on-surface-variant'>Total Books</p>
              <h3 className='text-display font-display text-on-surface mt-sm'>12,450</h3>
            </div>
            <div className='p-sm bg-primary-container/10 rounded-lg'>
              <span className='material-symbols-outlined text-primary' data-icon='menu_book'>menu_book</span>
            </div>
          </div>
          <div className='mt-lg flex items-center gap-xs text-label-sm font-label-sm text-green-600'>
            <span className='material-symbols-outlined text-[16px]' data-icon='trending_up'>trending_up</span>
            <span>12% from last month</span>
          </div>
        </div>

        <div className='bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-label-md font-label-md text-on-surface-variant'>Total Patrons</p>
              <h3 className='text-display font-display text-on-surface mt-sm'>3,210</h3>
            </div>
            <div className='p-sm bg-secondary-container/20 rounded-lg'>
              <span className='material-symbols-outlined text-secondary' data-icon='group'>group</span>
            </div>
          </div>
          <div className='mt-lg flex items-center gap-xs text-label-sm font-label-sm text-green-600'>
            <span className='material-symbols-outlined text-[16px]' data-icon='trending_up'>trending_up</span>
            <span>4% from last month</span>
          </div>
        </div>

        <div className='bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-label-md font-label-md text-on-surface-variant'>Books On Loan</p>
              <h3 className='text-display font-display text-on-surface mt-sm'>482</h3>
            </div>
            <div className='p-sm bg-tertiary-fixed/30 rounded-lg'>
              <span className='material-symbols-outlined text-tertiary' data-icon='handshake'>handshake</span>
            </div>
          </div>
          <div className='mt-lg flex items-center gap-xs text-label-sm font-label-sm text-error'>
            <span className='material-symbols-outlined text-[16px]' data-icon='trending_down'>trending_down</span>
            <span>2% from last month</span>
          </div>
        </div>
      </div>

      <section className='bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
        <div className='p-lg border-b border-outline-variant flex justify-between items-center'>
          <h2 className='text-headline-sm font-headline-sm text-on-surface'>Recent Activity</h2>
          <button className='text-primary font-label-md hover:underline'>View All Activity</button>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-surface-container text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider'>
                <th className='px-lg py-md font-semibold'>Book Title</th>
                <th className='px-lg py-md font-semibold'>Patron Name</th>
                <th className='px-lg py-md font-semibold'>Loan Date</th>
                <th className='px-lg py-md font-semibold'>Return Date</th>
                <th className='px-lg py-md font-semibold'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant'>
              {/* Rows will be dynamically generated here */}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
