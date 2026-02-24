'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
  selectedDate?: string;
  selectedTime?: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: string;
  label?: string;
  required?: boolean;
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate,
  label = 'Select Date & Time',
  required = false,
}: DateTimePickerProps) {
  const today = new Date().toISOString().split('T')[0];
  const minimumDate = minDate || today;

  // Available time slots
  const timeSlots = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      </div>

      {/* Date Picker */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate || ''}
          onChange={(e) => onDateChange(e.target.value)}
          min={minimumDate}
          required={required}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Time Picker */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Select Time
        </label>
        <div className="grid grid-cols-5 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => onTimeChange(time)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTime === time
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            <strong>Selected:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} at {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
}
