'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiClock, FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface TimePickerProps {
  value: string; // HH:mm 형식
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const TimePicker = ({ value, onChange, disabled = false, className = '' }: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [isAM, setIsAM] = useState(true);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // value가 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hourNum = parseInt(h);
      if (hourNum >= 12) {
        setIsAM(false);
        setHour(hourNum === 12 ? '12' : String(hourNum - 12).padStart(2, '0'));
      } else {
        setIsAM(true);
        setHour(hourNum === 0 ? '12' : String(hourNum).padStart(2, '0'));
      }
      setMinute(m || '00');
    }
  }, [value]);

  // 드롭다운 위치 계산
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      // 화면 상단에 가깝게 배치 (최소 20px 여백)
      const top = Math.max(20, buttonRect.top);
      
      setDropdownPosition({
        top,
        left: buttonRect.left,
        width: Math.max(buttonRect.width, 280),
      });
    }
  }, [isOpen]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdown = document.querySelector('[data-time-picker-dropdown]');
      
      // 버튼이나 드롭다운 내부가 아니면 닫기
      if (
        pickerRef.current && 
        !pickerRef.current.contains(target) &&
        (!dropdown || !dropdown.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, minute, isAM);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(hour, newMinute, isAM);
  };

  const handleAMPMChange = (newIsAM: boolean) => {
    setIsAM(newIsAM);
    updateTime(hour, minute, newIsAM);
  };

  const updateTime = (h: string, m: string, am: boolean) => {
    let hour24 = parseInt(h);
    if (!am && hour24 !== 12) {
      hour24 += 12;
    } else if (am && hour24 === 12) {
      hour24 = 0;
    }
    const newValue = `${String(hour24).padStart(2, '0')}:${m}`;
    onChange(newValue);
  };

  const formatDisplayTime = () => {
    if (!value) return '시간 선택';
    const [h, m] = value.split(':');
    const hourNum = parseInt(h);
    const period = hourNum >= 12 ? '오후' : '오전';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${period} ${String(displayHour).padStart(2, '0')}:${m}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const scrollToValue = (containerId: string, value: string) => {
    const container = document.getElementById(containerId);
    const element = container?.querySelector(`[data-value="${value}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToValue('hour-picker', hour);
        scrollToValue('minute-picker', minute);
      }, 100);
    }
  }, [isOpen, hour, minute]);

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-left
          border rounded-lg
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          border-gray-300 dark:border-gray-600
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          flex items-center justify-between gap-2
          hover:border-gray-400 dark:hover:border-gray-500
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center gap-2">
          <FiClock className="text-gray-400 dark:text-gray-500" size={18} />
          <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
            {formatDisplayTime()}
          </span>
        </div>
        {isOpen ? (
          <FiChevronUp className="text-gray-400" size={18} />
        ) : (
          <FiChevronDown className="text-gray-400" size={18} />
        )}
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          data-time-picker-dropdown
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            minWidth: '280px',
          }}
        >
          {/* AM/PM 선택 */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleAMPMChange(true)}
              className={`
                flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                ${isAM
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              오전
            </button>
            <button
              type="button"
              onClick={() => handleAMPMChange(false)}
              className={`
                flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                ${!isAM
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              오후
            </button>
          </div>

          {/* 시간/분 선택 */}
          <div className="flex gap-4">
            {/* 시간 선택 */}
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
                시간
              </div>
              <div
                id="hour-picker"
                className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              >
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    data-value={h}
                    onClick={() => handleHourChange(h)}
                    className={`
                      w-full px-3 py-2 text-center rounded transition-colors
                      ${hour === h
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* 분 선택 */}
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
                분
              </div>
              <div
                id="minute-picker"
                className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              >
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    data-value={m}
                    onClick={() => handleMinuteChange(m)}
                    className={`
                      w-full px-3 py-2 text-center rounded transition-colors
                      ${minute === m
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 확인 버튼 */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              확인
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
