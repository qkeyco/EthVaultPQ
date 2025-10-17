import { useMemo } from 'react';
import { VestingSchedule } from './VestingScheduleBuilder';

interface VestingTimelineGraphProps {
  schedule: VestingSchedule;
  currentProgress?: number; // 0-100
}

export function VestingTimelineGraph({ schedule, currentProgress = 0 }: VestingTimelineGraphProps) {
  const { timeline, milestones } = useMemo(() => {
    const now = new Date();
    const start = schedule.startDate;
    const cliffDate = new Date(start);
    cliffDate.setMonth(cliffDate.getMonth() + schedule.cliffMonths);

    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + schedule.vestingMonths);

    // Calculate progress
    const totalDuration = endDate.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

    // Calculate cliff position
    const cliffPercent = (schedule.cliffMonths / schedule.vestingMonths) * 100;

    // Generate monthly milestones
    const monthlyMilestones = [];
    for (let i = 0; i <= schedule.vestingMonths; i += Math.ceil(schedule.vestingMonths / 12)) {
      const date = new Date(start);
      date.setMonth(date.getMonth() + i);
      const percent = (i / schedule.vestingMonths) * 100;

      // Calculate vested amount at this milestone
      let vestedPercent = 0;
      if (i > schedule.cliffMonths) {
        vestedPercent = ((i - schedule.cliffMonths) / (schedule.vestingMonths - schedule.cliffMonths)) * 100;
      }

      monthlyMilestones.push({
        month: i,
        date,
        position: percent,
        vestedPercent,
        amount: (parseFloat(schedule.totalAmount) * vestedPercent / 100).toFixed(2),
      });
    }

    return {
      timeline: {
        start,
        cliffDate,
        endDate,
        cliffPercent,
        progressPercent: currentProgress || progressPercent,
      },
      milestones: monthlyMilestones,
    };
  }, [schedule, currentProgress]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (months: number) => {
    if (schedule.mode === 'test') {
      return `${months} ${months === 1 ? 'minute' : 'minutes'}`;
    }
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Vesting Timeline</h3>

      {/* Timeline Visualization */}
      <div className="relative mb-8">
        {/* Progress Bar */}
        <div className="h-8 bg-gray-100 rounded-full relative overflow-hidden">
          {/* Cliff Region */}
          {schedule.cliffMonths > 0 && (
            <div
              className="absolute top-0 left-0 h-full bg-red-100 border-r-2 border-red-300"
              style={{ width: `${timeline.cliffPercent}%` }}
            />
          )}

          {/* Vested Region */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
            style={{ width: `${timeline.progressPercent}%` }}
          />

          {/* Current Position Indicator */}
          {timeline.progressPercent > 0 && timeline.progressPercent < 100 && (
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-lg"
              style={{ left: `${timeline.progressPercent}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap">
                {timeline.progressPercent.toFixed(1)}%
              </div>
            </div>
          )}

          {/* Cliff Marker */}
          {schedule.cliffMonths > 0 && (
            <div
              className="absolute top-0 h-full w-0.5 bg-red-500"
              style={{ left: `${timeline.cliffPercent}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                Cliff End
              </div>
            </div>
          )}
        </div>

        {/* Timeline Labels */}
        <div className="flex justify-between mt-3 text-xs text-gray-600">
          <div className="text-left">
            <div className="font-medium text-gray-900">Start</div>
            <div>{formatDate(timeline.start)}</div>
          </div>
          {schedule.cliffMonths > 0 && (
            <div className="text-center">
              <div className="font-medium text-red-600">Cliff</div>
              <div>{formatTime(schedule.cliffMonths)}</div>
            </div>
          )}
          <div className="text-right">
            <div className="font-medium text-gray-900">End</div>
            <div>{formatDate(timeline.endDate)}</div>
          </div>
        </div>
      </div>

      {/* Vesting Curve Graph */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vesting Curve</h4>
        <div className="relative h-48 bg-gray-50 rounded-lg p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Graph area */}
          <div className="ml-8 h-full relative">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${percent}%` }}
              />
            ))}

            {/* Vesting curve */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {/* Cliff period (horizontal line at 0%) */}
              {schedule.cliffMonths > 0 && (
                <line
                  x1="0%"
                  y1="100%"
                  x2={`${timeline.cliffPercent}%`}
                  y2="100%"
                  stroke="#EF4444"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              )}

              {/* Linear vesting curve */}
              <line
                x1={`${timeline.cliffPercent}%`}
                y1="100%"
                x2="100%"
                y2="0%"
                stroke="#4F46E5"
                strokeWidth="3"
              />

              {/* Current progress point */}
              {timeline.progressPercent > timeline.cliffPercent && (
                <>
                  <line
                    x1={`${timeline.progressPercent}%`}
                    y1="0%"
                    x2={`${timeline.progressPercent}%`}
                    y2="100%"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={`${timeline.progressPercent}%`}
                    cy={`${100 - ((timeline.progressPercent - timeline.cliffPercent) / (100 - timeline.cliffPercent) * 100)}%`}
                    r="5"
                    fill="#10B981"
                    stroke="white"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>

            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
              {milestones.map((milestone, idx) => (
                <span key={idx} className="transform -rotate-45 origin-top-left">
                  {milestone.month}m
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Table */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vesting Milestones</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Vested %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {milestones.map((milestone, idx) => {
                const isPast = milestone.date < new Date();
                const isCliff = milestone.month <= schedule.cliffMonths;

                return (
                  <tr key={idx} className={isPast ? 'bg-green-50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900">{milestone.month}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{formatDate(milestone.date)}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      {milestone.vestedPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {milestone.amount} MUSDC
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {isPast ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Unlocked
                        </span>
                      ) : isCliff ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔒 Cliff
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ⏳ Pending
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

      {/* Test Mode Indicator */}
      {schedule.mode === 'test' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2 text-sm text-green-800">
            <span className="text-lg">⚡</span>
            <span className="font-medium">
              Test Mode Active: {schedule.vestingMonths} months = {schedule.vestingMonths} minutes
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
