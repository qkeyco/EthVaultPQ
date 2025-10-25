import { useState, useMemo, useEffect } from 'react';
import {
  vestingScheduleToJSON,
  jsonToVestingSchedule,
  exportScheduleToFile,
  importScheduleFromFile,
  copyScheduleToClipboard,
  pasteScheduleFromClipboard,
} from '../utils/vestingConverter';

export type VestingPreset = '60-month-linear' | '4-year-cliff' | 'custom';
export type VestingMode = 'production' | 'test';

export interface VestingSchedule {
  preset: VestingPreset;
  mode: VestingMode;
  totalAmount: string;
  startDate: Date;
  cliffMonths: number;
  vestingMonths: number;
  recipients: VestingRecipient[];
}

export interface VestingRecipient {
  address: string;
  percentage: number;
  isVault: boolean;
}

const PRESET_SCHEDULES = {
  '60-month-linear': {
    name: '60-Month Linear',
    description: '5-year linear vesting with no cliff',
    cliffMonths: 0,
    vestingMonths: 60,
  },
  '4-year-cliff': {
    name: '4-Year with 1-Year Cliff',
    description: '1-year cliff, then linear vesting over 3 years (48 months total)',
    cliffMonths: 12,
    vestingMonths: 48,
  },
  'custom': {
    name: 'Custom Schedule',
    description: 'Define your own vesting parameters',
    cliffMonths: 0,
    vestingMonths: 12,
  },
};

interface VestingScheduleBuilderProps {
  onScheduleChange: (schedule: VestingSchedule) => void;
}

export function VestingScheduleBuilder({ onScheduleChange }: VestingScheduleBuilderProps) {
  const [preset, setPreset] = useState<VestingPreset>('60-month-linear');
  const [mode, setMode] = useState<VestingMode>('test');
  const [totalAmount, setTotalAmount] = useState('1000000');

  // Default start date: 1 minute from now (test mode friendly)
  const defaultStartDate = new Date();
  defaultStartDate.setMinutes(defaultStartDate.getMinutes() + 1);
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [cliffMonths, setCliffMonths] = useState(0);
  const [vestingMonths, setVestingMonths] = useState(60);
  const [recipients, setRecipients] = useState<VestingRecipient[]>([
    { address: '', percentage: 100, isVault: false },
  ]);

  // Calculate vesting details
  const vestingDetails = useMemo(() => {
    const selectedPreset = PRESET_SCHEDULES[preset];
    const currentCliff = preset === 'custom' ? cliffMonths : selectedPreset.cliffMonths;
    const currentVesting = preset === 'custom' ? vestingMonths : selectedPreset.vestingMonths;

    // In test mode: 1 minute = 1 month
    const timeMultiplier = mode === 'test' ? 1 / (30 * 24 * 60) : 1; // minutes to months conversion
    const realCliffTime = currentCliff * timeMultiplier;
    const realVestingTime = currentVesting * timeMultiplier;

    const cliffDate = new Date(startDate);
    cliffDate.setMonth(cliffDate.getMonth() + currentCliff);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + currentVesting);

    // Calculate if any vesting is already unlocked (past-due)
    const now = new Date();
    const monthsPassed = Math.max(0,
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const vestedPercentage = Math.min(100,
      monthsPassed > currentCliff
        ? ((monthsPassed - currentCliff) / (currentVesting - currentCliff)) * 100
        : 0
    );

    return {
      cliffMonths: currentCliff,
      vestingMonths: currentVesting,
      cliffDate,
      endDate,
      realCliffTime: mode === 'test' ? `${Math.ceil(realCliffTime)} minutes` : `${currentCliff} months`,
      realVestingTime: mode === 'test' ? `${Math.ceil(realVestingTime)} minutes` : `${currentVesting} months`,
      monthsPassed: Math.floor(monthsPassed),
      vestedPercentage: Math.round(vestedPercentage),
      isPastDue: startDate < now,
      catchUpAmount: vestedPercentage > 0 ? (parseFloat(totalAmount) * vestedPercentage / 100).toFixed(2) : '0',
    };
  }, [preset, mode, startDate, cliffMonths, vestingMonths, totalAmount]);

  // Update parent when schedule changes
  useEffect(() => {
    const schedule: VestingSchedule = {
      preset,
      mode,
      totalAmount,
      startDate,
      cliffMonths: vestingDetails.cliffMonths,
      vestingMonths: vestingDetails.vestingMonths,
      recipients,
    };
    onScheduleChange(schedule);
  }, [preset, mode, totalAmount, startDate, vestingDetails.cliffMonths, vestingDetails.vestingMonths, recipients, onScheduleChange]);

  const handlePresetChange = (newPreset: VestingPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      setCliffMonths(PRESET_SCHEDULES[newPreset].cliffMonths);
      setVestingMonths(PRESET_SCHEDULES[newPreset].vestingMonths);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', percentage: 0, isVault: false }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: keyof VestingRecipient, value: any) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const totalPercentage = recipients.reduce((sum, r) => sum + r.percentage, 0);

  // Import/Export handlers
  const handleExport = async () => {
    try {
      const schedule: VestingSchedule = {
        preset,
        mode,
        totalAmount,
        startDate,
        cliffMonths: vestingDetails.cliffMonths,
        vestingMonths: vestingDetails.vestingMonths,
        recipients,
      };

      const jsonSchedule = vestingScheduleToJSON(
        schedule,
        'tenderly',
        '0xc351De5746211E2B7688D7650A8bF7D91C809c0D', // MockToken address
        'MUSDC',
        6,
        0, // Current block number (will be replaced with actual)
      );

      exportScheduleToFile(jsonSchedule);
    } catch (error) {
      alert('Failed to export schedule: ' + (error as Error).message);
    }
  };

  const handleImport = async () => {
    try {
      const jsonSchedule = await importScheduleFromFile();
      const imported = jsonToVestingSchedule(jsonSchedule);

      setPreset(imported.preset);
      setMode(imported.mode);
      setTotalAmount(imported.totalAmount);
      setStartDate(imported.startDate);
      setCliffMonths(imported.cliffMonths);
      setVestingMonths(imported.vestingMonths);
      setRecipients(imported.recipients);
    } catch (error) {
      alert('Failed to import schedule: ' + (error as Error).message);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const schedule: VestingSchedule = {
        preset,
        mode,
        totalAmount,
        startDate,
        cliffMonths: vestingDetails.cliffMonths,
        vestingMonths: vestingDetails.vestingMonths,
        recipients,
      };

      const jsonSchedule = vestingScheduleToJSON(
        schedule,
        'tenderly',
        '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
        'MUSDC',
        6,
        0,
      );

      await copyScheduleToClipboard(jsonSchedule);
      alert('Schedule copied to clipboard!');
    } catch (error) {
      alert('Failed to copy to clipboard: ' + (error as Error).message);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const jsonSchedule = await pasteScheduleFromClipboard();
      const imported = jsonToVestingSchedule(jsonSchedule);

      setPreset(imported.preset);
      setMode(imported.mode);
      setTotalAmount(imported.totalAmount);
      setStartDate(imported.startDate);
      setCliffMonths(imported.cliffMonths);
      setVestingMonths(imported.vestingMonths);
      setRecipients(imported.recipients);

      alert('Schedule imported from clipboard!');
    } catch (error) {
      alert('Failed to paste from clipboard: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Vesting Schedule Preset</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(PRESET_SCHEDULES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key as VestingPreset)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                preset === key
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{value.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{value.description}</p>
              <div className="mt-2 text-sm font-medium text-indigo-600">
                {value.cliffMonths > 0 && `${value.cliffMonths}mo cliff + `}
                {value.vestingMonths}mo vesting
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Vesting Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('test')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              mode === 'test'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-semibold text-gray-900">Test Mode</h4>
            <p className="text-xs text-gray-600 mt-1">1 minute = 1 month (for testing)</p>
            <div className="mt-2 text-sm font-medium text-green-600">
              ⚡ {vestingDetails.vestingMonths} months = {Math.ceil(vestingDetails.vestingMonths)} minutes
            </div>
          </button>
          <button
            onClick={() => setMode('production')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              mode === 'production'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-semibold text-gray-900">Production Mode</h4>
            <p className="text-xs text-gray-600 mt-1">Real-time vesting (months = months)</p>
            <div className="mt-2 text-sm font-medium text-blue-600">
              🕐 {vestingDetails.vestingMonths} months = {vestingDetails.vestingMonths} months
            </div>
          </button>
        </div>
      </div>

      {/* Schedule Parameters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Vesting Parameters</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Total Amount (MUSDC)
              <span className="text-blue-500 cursor-help" title="Total tokens to vest across all recipients. Example: 1000000 MUSDC = 1 million tokens">ℹ️</span>
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="1000000"
            />
            <p className="text-xs text-gray-500 mt-1">How many tokens to distribute in total</p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              Start Date
              <span className="text-blue-500 cursor-help" title="When vesting begins. In Test Mode: use a time 1-2 minutes from now. In Production: use the actual start date.">ℹ️</span>
            </label>
            <input
              type="datetime-local"
              value={startDate.toISOString().slice(0, 16)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">When the vesting schedule begins</p>
          </div>

          {/* Custom Parameters */}
          {preset === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliff Period (months)
                </label>
                <input
                  type="number"
                  value={cliffMonths}
                  onChange={(e) => setCliffMonths(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Vesting Period (months)
                </label>
                <input
                  type="number"
                  value={vestingMonths}
                  onChange={(e) => setVestingMonths(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
            </>
          )}
        </div>

        {/* Past-Due Warning */}
        {vestingDetails.isPastDue && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Start Date is in the Past
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {vestingDetails.monthsPassed} months have passed. {vestingDetails.vestedPercentage}%
                  ({vestingDetails.catchUpAmount} tokens) will be immediately available for withdrawal
                  as "catch-up" vesting.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipients */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Recipients
            <span className="text-blue-500 cursor-help text-base" title="Who receives the vested tokens. Enter wallet address (0x...) and percentage. Total must equal 100%. Use 'Add Recipient' for multiple recipients.">ℹ️</span>
          </h3>
          <button
            onClick={addRecipient}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            title="Add another recipient to split tokens between multiple addresses"
          >
            + Add Recipient
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Specify who will receive tokens and what percentage each gets</p>

        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
              <div className="flex-1">
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                  placeholder="0x... (wallet or vault address)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={recipient.percentage}
                  onChange={(e) => updateRecipient(index, 'percentage', parseFloat(e.target.value) || 0)}
                  placeholder="%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={recipient.isVault}
                    onChange={(e) => updateRecipient(index, 'isVault', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-700">Vault</span>
                </label>
              </div>
              {recipients.length > 1 && (
                <button
                  onClick={() => removeRecipient(index)}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Percentage Check */}
        <div className="mt-3 flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Allocation:</span>
          <span className={`font-semibold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPercentage.toFixed(1)}% {totalPercentage === 100 ? '✓' : '(must equal 100%)'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">Vesting Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-indigo-700">Mode:</span>
            <span className="ml-2 font-medium text-indigo-900">
              {mode === 'test' ? '⚡ Test (1 min = 1 month)' : '🕐 Production'}
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Total Amount:</span>
            <span className="ml-2 font-medium text-indigo-900">{totalAmount} MUSDC</span>
          </div>
          <div>
            <span className="text-indigo-700">Start Date:</span>
            <span className="ml-2 font-medium text-indigo-900">
              {startDate.toLocaleDateString()} {startDate.toLocaleTimeString()}
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Cliff Period:</span>
            <span className="ml-2 font-medium text-indigo-900">
              {vestingDetails.cliffMonths} months ({vestingDetails.realCliffTime})
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Cliff Ends:</span>
            <span className="ml-2 font-medium text-indigo-900">
              {vestingDetails.cliffDate.toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Vesting Period:</span>
            <span className="ml-2 font-medium text-indigo-900">
              {vestingDetails.vestingMonths} months ({vestingDetails.realVestingTime})
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Vesting Ends:</span>
            <span className="ml-2 font-medium text-indigo-900">
              {vestingDetails.endDate.toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Recipients:</span>
            <span className="ml-2 font-medium text-indigo-900">{recipients.length}</span>
          </div>
        </div>
      </div>

      {/* Import/Export Bar - Moved to bottom */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Import/Export Schedule
              <span className="text-blue-500 cursor-help text-base" title="Save your vesting configuration as a JSON file or load a previously saved configuration. Useful for backing up or sharing vesting schedules.">ℹ️</span>
            </h3>
            <p className="text-xs text-gray-600 mt-1">Save or load vesting configurations as JSON</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleImport}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Import from JSON file"
            >
              📂 Import File
            </button>
            <button
              onClick={handlePasteFromClipboard}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Paste from clipboard"
            >
              📋 Paste
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Copy to clipboard"
            >
              📄 Copy
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              title="Export to JSON file"
            >
              💾 Export File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
