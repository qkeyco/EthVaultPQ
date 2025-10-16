import { useState } from 'react';

interface PaymentMilestone {
  date: Date;
  percentage: number;
  amount: number;
  description: string;
}

interface PaymentScheduleBuilderProps {
  totalAmount: number;
  onScheduleChange: (milestones: PaymentMilestone[]) => void;
}

export const PaymentScheduleBuilder = ({
  totalAmount,
  onScheduleChange,
}: PaymentScheduleBuilderProps) => {
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({
    date: '',
    percentage: '',
    description: '',
  });

  const addMilestone = () => {
    if (!newMilestone.date || !newMilestone.percentage) {
      alert('Please fill in date and percentage');
      return;
    }

    const percentage = parseFloat(newMilestone.percentage);
    if (percentage <= 0 || percentage > 100) {
      alert('Percentage must be between 0 and 100');
      return;
    }

    const totalAllocated = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalAllocated + percentage > 100) {
      alert(`Cannot allocate ${percentage}%. Only ${100 - totalAllocated}% remaining.`);
      return;
    }

    const milestone: PaymentMilestone = {
      date: new Date(newMilestone.date),
      percentage,
      amount: (totalAmount * percentage) / 100,
      description: newMilestone.description || `Payment ${milestones.length + 1}`,
    };

    const updated = [...milestones, milestone].sort((a, b) => a.date.getTime() - b.date.getTime());
    setMilestones(updated);
    onScheduleChange(updated);

    // Reset form
    setNewMilestone({ date: '', percentage: '', description: '' });
  };

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
    onScheduleChange(updated);
  };

  const totalAllocated = milestones.reduce((sum, m) => sum + m.percentage, 0);
  const remaining = 100 - totalAllocated;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const presets = [
    {
      name: 'Equal Monthly (12 months)',
      generate: () => {
        const milestones: PaymentMilestone[] = [];
        const startDate = new Date();
        for (let i = 1; i <= 12; i++) {
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + i);
          milestones.push({
            date,
            percentage: 100 / 12,
            amount: totalAmount / 12,
            description: `Month ${i}`,
          });
        }
        return milestones;
      },
    },
    {
      name: 'Quarterly (4 quarters)',
      generate: () => {
        const milestones: PaymentMilestone[] = [];
        const startDate = new Date();
        for (let i = 1; i <= 4; i++) {
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + (i * 3));
          milestones.push({
            date,
            percentage: 25,
            amount: totalAmount * 0.25,
            description: `Q${i}`,
          });
        }
        return milestones;
      },
    },
    {
      name: 'Front-loaded (50/30/20)',
      generate: () => {
        const startDate = new Date();
        const month1 = new Date(startDate);
        month1.setMonth(month1.getMonth() + 1);
        const month2 = new Date(startDate);
        month2.setMonth(month2.getMonth() + 2);
        const month3 = new Date(startDate);
        month3.setMonth(month3.getMonth() + 3);

        return [
          { date: month1, percentage: 50, amount: totalAmount * 0.5, description: 'Initial Payment' },
          { date: month2, percentage: 30, amount: totalAmount * 0.3, description: 'Second Payment' },
          { date: month3, percentage: 20, amount: totalAmount * 0.2, description: 'Final Payment' },
        ];
      },
    },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const generated = preset.generate();
    setMilestones(generated);
    onScheduleChange(generated);
  };

  return (
    <div className="space-y-6">
      {/* Header with allocation status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Custom Payment Schedule</h3>
          <div className="text-sm">
            <span className="text-gray-500">Allocated: </span>
            <span className={`font-bold ${remaining === 0 ? 'text-green-600' : 'text-blue-600'}`}>
              {totalAllocated.toFixed(2)}%
            </span>
            <span className="text-gray-500"> / Remaining: </span>
            <span className={`font-bold ${remaining === 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {remaining.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              remaining === 0 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${totalAllocated}%` }}
          />
        </div>

        {/* Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets:</label>
          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Add milestone form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={newMilestone.date}
              onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
            <input
              type="number"
              value={newMilestone.percentage}
              onChange={(e) => setNewMilestone({ ...newMilestone, percentage: e.target.value })}
              placeholder="25"
              min="0"
              max={remaining}
              step="0.01"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              placeholder="Optional"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addMilestone}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add Milestone
            </button>
          </div>
        </div>
      </div>

      {/* Milestones table */}
      {milestones.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-md font-semibold mb-4">Scheduled Payments</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {milestones.map((milestone, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(milestone.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {milestone.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {milestone.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(milestone.amount)} tokens
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
