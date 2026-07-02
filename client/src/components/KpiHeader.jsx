import React from 'react';
import { TrendingUp, TrendingDown, Percent, Package, ShieldAlert, BarChart3 } from 'lucide-react';

export default function KpiHeader({ kpis, loading }) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-4 gap-5 mb-8'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse h-28'></div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const { sales_per_linear_ft, private_brand_pct, in_stock_rate, shelf_capacity } = kpis;

  const renderTrend = (change) => {
    if (change === 0) return <span className='text-gray-400 text-xs font-medium'>No change</span>;
    const isPositive = change > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{isPositive ? '+' : ''}{change}% WoW</span>
      </span>
    );
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-5 mb-8'>
      {/* Sales per Linear Ft */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Sales per Linear Ft</span>
          <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
            <BarChart3 size={16} />
          </div>
        </div>
        <div>
          <h3 className='text-2xl font-bold text-gray-900'>
            ${sales_per_linear_ft?.value?.toFixed(2)}
          </h3>
          <div className='mt-1 flex items-center gap-2'>
            {renderTrend(sales_per_linear_ft?.change)}
          </div>
        </div>
      </div>

      {/* Private Brand % */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Private Brand %</span>
          <div className='p-2 bg-yellow-50 text-yellow-600 rounded-lg'>
            <Percent size={16} />
          </div>
        </div>
        <div>
          <h3 className='text-2xl font-bold text-gray-900'>
            {private_brand_pct?.value?.toFixed(1)}%
          </h3>
          <div className='mt-1 flex items-center gap-2'>
            {renderTrend(private_brand_pct?.change)}
            <span className='text-[10px] text-gray-400 font-medium'>(Target: >25%)</span>
          </div>
        </div>
      </div>

      {/* In-Stock Rate */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>In-Stock Rate</span>
          <div className='p-2 bg-green-50 text-green-600 rounded-lg'>
            <Package size={16} />
          </div>
        </div>
        <div>
          <h3 className='text-2xl font-bold text-gray-900'>
            {in_stock_rate?.value?.toFixed(1)}%
          </h3>
          <div className='mt-1 flex items-center gap-2'>
            {renderTrend(in_stock_rate?.change)}
          </div>
        </div>
      </div>

      {/* Shelf Capacity */}
      <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Shelf Capacity</span>
          <div className='p-2 bg-purple-50 text-purple-600 rounded-lg'>
            <ShieldAlert size={16} />
          </div>
        </div>
        <div>
          <h3 className='text-2xl font-bold text-gray-900'>
            {shelf_capacity?.value}%
          </h3>
          <div className='mt-1 flex items-center gap-2'>
            <span className='text-xs text-gray-500 font-medium'>
              {shelf_capacity?.value > 90 ? 'Near Capacity' : 'Optimal Space'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}