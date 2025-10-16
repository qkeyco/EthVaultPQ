import { useMemo } from 'react';

interface VestingTimelineProps {
  totalAmount: number;
  vestingDuration: number; // in days
  cliffDuration: number; // in days
  startDate?: Date;
}

export const VestingTimeline = ({
  totalAmount,
  vestingDuration,
  cliffDuration,
  startDate = new Date(),
}: VestingTimelineProps) => {
  const schedulePoints = useMemo(() => {
    if (!totalAmount || !vestingDuration) return [];

    const points = [];
    const cliffDate = new Date(startDate);
    cliffDate.setDate(cliffDate.getDate() + cliffDuration);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + vestingDuration);

    // Add start point (0%)
    points.push({
      date: startDate,
      percentage: 0,
      amount: 0,
      label: 'Start',
      isCliff: false,
    });

    // Add cliff point if applicable
    if (cliffDuration > 0) {
      points.push({
        date: cliffDate,
        percentage: 0,
        amount: 0,
        label: 'Cliff End',
        isCliff: true,
      });
    }

    // Add monthly milestones after cliff
    const monthsAfterCliff = Math.ceil((vestingDuration - cliffDuration) / 30);
    for (let i = 1; i <= monthsAfterCliff; i++) {
      const milestoneDate = new Date(cliffDate);
      milestoneDate.setDate(milestoneDate.getDate() + (i * 30));

      if (milestoneDate <= endDate) {
        const daysFromStart = Math.floor((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysFromCliff = Math.max(0, daysFromStart - cliffDuration);
        const vestingDays = vestingDuration - cliffDuration;
        const percentage = Math.min(100, (daysFromCliff / vestingDays) * 100);
        const amount = (totalAmount * percentage) / 100;

        points.push({
          date: milestoneDate,
          percentage,
          amount,
          label: `Month ${i}`,
          isCliff: false,
        });
      }
    }

    // Add end point (100%)
    points.push({
      date: endDate,
      percentage: 100,
      amount: totalAmount,
      label: 'Fully Vested',
      isCliff: false,
    });

    return points;
  }, [totalAmount, vestingDuration, cliffDuration, startDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Visual Timeline Graph */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Vesting Timeline</h3>

        {/* Graph */}
        <div className="relative h-64 mb-8">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Graph area */}
          <div className="ml-12 h-full relative border-l-2 border-b-2 border-gray-300">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-gray-200"
                  style={{ bottom: `${percent}%` }}
                />
              ))}
            </div>

            {/* Vesting line */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="vestingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area under the line */}
              <path
                d={`
                  M 0 100%
                  ${schedulePoints.map((point, i) => {
                    const x = (i / (schedulePoints.length - 1)) * 100;
                    const y = 100 - point.percentage;
                    return `L ${x}% ${y}%`;
                  }).join(' ')}
                  L 100% 100%
                  Z
                `}
                fill="url(#vestingGradient)"
              />

              {/* Line */}
              <polyline
                points={schedulePoints.map((point, i) => {
                  const x = (i / (schedulePoints.length - 1)) * 100;
                  const y = 100 - point.percentage;
                  return `${x}%,${y}%`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                className="transition-all duration-300"
              />

              {/* Points */}
              {schedulePoints.map((point, i) => {
                const x = (i / (schedulePoints.length - 1)) * 100;
                const y = 100 - point.percentage;
                return (
                  <circle
                    key={i}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="5"
                    fill={point.isCliff ? '#ef4444' : '#10b981'}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:r-7"
                  />
                );
              })}
            </svg>

            {/* Cliff indicator */}
            {cliffDuration > 0 && (
              <div
                className="absolute top-0 bottom-0 w-px bg-red-400 border-l-2 border-dashed"
                style={{ left: `${(cliffDuration / vestingDuration) * 100}%` }}
              >
                <div className="absolute -top-6 left-2 text-xs text-red-600 font-semibold whitespace-nowrap">
                  Cliff Period
                </div>
              </div>
            )}
          </div>

          {/* X-axis timeline */}
          <div className="ml-12 mt-2 flex justify-between text-xs text-gray-500">
            <span>{formatDate(startDate)}</span>
            <span>{formatDate(new Date(startDate.getTime() + vestingDuration * 24 * 60 * 60 * 1000))}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Vested Amount</span>
          </div>
          {cliffDuration > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              <span>Cliff Period</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Schedule Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Milestone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vested %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedulePoints.map((point, index) => {
                const isPast = point.date < new Date();
                const isToday = point.date.toDateString() === new Date().toDateString();

                return (
                  <tr key={index} className={isPast ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(point.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {point.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {point.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(point.amount)} tokens
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isPast ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Unlocked
                        </span>
                      ) : isToday ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unlocking Today
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Amount</div>
          <div className="text-2xl font-bold text-gray-900">{formatAmount(totalAmount)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Vesting Period</div>
          <div className="text-2xl font-bold text-gray-900">{vestingDuration} days</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Cliff Period</div>
          <div className="text-2xl font-bold text-gray-900">{cliffDuration} days</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Daily Unlock Rate</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(totalAmount / (vestingDuration - cliffDuration))}
          </div>
        </div>
      </div>
    </div>
  );
};
