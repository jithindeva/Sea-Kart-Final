"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeliverySchedulerProps {
  onSlotChange: (slot: string) => void;
  selectedSlot: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Delivery hours: 6 AM to 10 PM only
const DELIVERY_START_HOUR = 6;  // 6 AM
const DELIVERY_END_HOUR = 22;   // 10 PM

const isValidDeliveryHour = (h24: number) => h24 >= DELIVERY_START_HOUR && h24 < DELIVERY_END_HOUR;

// Build quick slot chips from now + 1hr, stepping by 30 mins, for next 8 valid slots
const buildQuickSlots = (selectedDate: Date | null) => {
  const now = new Date();
  const base = new Date(now);
  base.setMinutes(base.getMinutes() < 30 ? 30 : 60, 0, 0);
  // Advance at least 1 hour
  if (base.getTime() - now.getTime() < 60 * 60 * 1000) {
    base.setHours(base.getHours() + 1, 0, 0, 0);
  }
  // Clamp to delivery start if before 6 AM
  if (base.getHours() < DELIVERY_START_HOUR) {
    base.setHours(DELIVERY_START_HOUR, 0, 0, 0);
  }

  const slots: { label: string; h24: number; min: number }[] = [];
  const cursor = new Date(base);
  let iterations = 0;
  while (slots.length < 8 && iterations < 48) {
    iterations++;
    const h24 = cursor.getHours();
    const min = cursor.getMinutes();
    // Only add slots within delivery hours (6 AM – 10 PM)
    if (isValidDeliveryHour(h24)) {
      const ampm = h24 < 12 ? 'AM' : 'PM';
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      slots.push({
        label: `${h12}:${String(min).padStart(2, '0')} ${ampm}`,
        h24,
        min,
      });
    }
    cursor.setMinutes(cursor.getMinutes() + 30);
    // If we've gone past 10 PM, stop
    if (cursor.getHours() >= DELIVERY_END_HOUR && cursor.getMinutes() > 0) break;
    if (cursor.getHours() === 0) break; // past midnight, stop
  }
  return slots;
};

const DeliveryScheduler = ({ onSlotChange, selectedSlot }: DeliverySchedulerProps) => {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  // ── View state ──────────────────────────────────────────────────────────
  const [viewYear, setViewYear] = useState(todayMidnight.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayMidnight.getMonth());
  const [direction, setDirection] = useState<1 | -1>(1);

  // ── Selection state ─────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hours12, setHours12] = useState(9);   // 1-12
  const [minutes, setMinutes] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  // Convert 12h → 24h
  const to24h = (h: number, a: 'AM' | 'PM') => {
    if (a === 'AM') return h === 12 ? 0 : h;
    return h === 12 ? 12 : h + 12;
  };

  // ── Min hour for today ───────────────────────────────────────────────────
  const minHour24 = (() => {
    if (!selectedDate) return 0;
    const s = new Date(selectedDate);
    s.setHours(0, 0, 0, 0);
    return s.getTime() === todayMidnight.getTime()
      ? new Date().getHours() + 1
      : 0;
  })();

  // ── Emit slot ────────────────────────────────────────────────────────────
  const emit = (date: Date | null, h12: number, min: number, ap: 'AM' | 'PM') => {
    if (!date) return;
    const h24 = to24h(h12, ap);
    const datePart = date.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
    const timePart = `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ap}`;
    onSlotChange(`${datePart} at ${timePart}`);
  };

  // ── Calendar helpers ─────────────────────────────────────────────────────
  const isPast = (day: number) => new Date(viewYear, viewMonth, day) < todayMidnight;
  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;
  const isToday = (day: number) => {
    const t = new Date();
    return t.getDate() === day && t.getMonth() === viewMonth && t.getFullYear() === viewYear;
  };

  const calCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const isNavigatingBack =
    viewYear === todayMidnight.getFullYear() && viewMonth === todayMidnight.getMonth();

  const prevMonth = () => {
    if (isNavigatingBack) return;
    setDirection(-1);
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    setDirection(1);
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    if (isPast(day)) return;
    const d = new Date(viewYear, viewMonth, day);
    setSelectedDate(d);

    const isToday = d.getTime() === todayMidnight.getTime();

    let defH24: number;
    if (isToday) {
      // Today: start from current hour + 1, clamped into delivery window
      defH24 = Math.max(minHour24, DELIVERY_START_HOUR);
      if (defH24 >= DELIVERY_END_HOUR) defH24 = DELIVERY_END_HOUR - 1;
    } else {
      // Any future date: always start from 6 AM (delivery open time)
      defH24 = DELIVERY_START_HOUR;
    }

    const defAp: 'AM' | 'PM' = defH24 < 12 ? 'AM' : 'PM';
    const defH12 = defH24 % 12 === 0 ? 12 : defH24 % 12;
    setHours12(defH12);
    setMinutes(0);
    setAmpm(defAp);
    emit(d, defH12, 0, defAp);
  };

  // ── Hour spinner — steps by exactly 1 hour in 24h space ─────────────────
  const adjustHour = (delta: number) => {
    // Work in 24h to avoid AM/PM confusion
    const current24 = to24h(hours12, ampm);
    let next24 = current24 + delta;

    // Wrap around 0–23
    if (next24 > 23) next24 = 0;
    if (next24 < 0) next24 = 23;

    // If landing in the blocked night window (22–5 inclusive), skip to boundary
    if (!isValidDeliveryHour(next24)) {
      if (delta > 0) {
        // Moving forward → land at 6 AM (start of delivery)
        next24 = DELIVERY_START_HOUR;
      } else {
        // Moving backward → land at 9 PM (last valid hour = 21)
        next24 = DELIVERY_END_HOUR - 1;
      }
    }

    // For today: don't allow before minHour24
    if (next24 < minHour24) {
      next24 = Math.max(minHour24, DELIVERY_START_HOUR);
    }

    const newAp: 'AM' | 'PM' = next24 < 12 ? 'AM' : 'PM';
    const newH12 = next24 % 12 === 0 ? 12 : next24 % 12;
    setHours12(newH12);
    setAmpm(newAp);
    emit(selectedDate, newH12, minutes, newAp);
  };

  const adjustMinute = (delta: number) => {
    const steps = [0, 15, 30, 45];
    const idx = steps.indexOf(minutes);
    const newIdx = (idx + delta + 4) % 4;
    setMinutes(steps[newIdx]);
    emit(selectedDate, hours12, steps[newIdx], ampm);
  };

  const toggleAmpm = () => {
    const next: 'AM' | 'PM' = ampm === 'AM' ? 'PM' : 'AM';
    const h24 = to24h(hours12, next);
    if (h24 < minHour24) return; // Don't allow going before minHour
    if (!isValidDeliveryHour(h24)) return; // Don't allow outside delivery hours
    setAmpm(next);
    emit(selectedDate, hours12, minutes, next);
  };

  // ── Quick slot chips ─────────────────────────────────────────────────────
  const quickSlots = useMemo(() => buildQuickSlots(selectedDate), [selectedDate]);

  const applyQuickSlot = (slot: { label: string; h24: number; min: number }) => {
    if (!selectedDate) return;
    const ap: 'AM' | 'PM' = slot.h24 < 12 ? 'AM' : 'PM';
    const h12 = slot.h24 % 12 === 0 ? 12 : slot.h24 % 12;
    setHours12(h12);
    setMinutes(slot.min);
    setAmpm(ap);
    emit(selectedDate, h12, slot.min, ap);
  };

  // ── AM/PM indicator for min time ─────────────────────────────────────────
  const minTimeLabel = (() => {
    if (!selectedDate || minHour24 === 0) return null;
    const ap: 'AM' | 'PM' = minHour24 < 12 ? 'AM' : 'PM';
    const h12 = minHour24 % 12 === 0 ? 12 : minHour24 % 12;
    return `${h12}:00 ${ap}`;
  })();

  return (
    <div className="w-full space-y-3">

      {/* ── COMPACT CALENDAR ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">

        {/* Calendar header — mini */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500">
          <button
            onClick={prevMonth}
            disabled={isNavigatingBack}
            className="w-5 h-5 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${viewYear}-${viewMonth}`}
              initial={{ x: direction * 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-white font-bold text-[11px]"
            >
              {MONTHS[viewMonth]} {viewYear}
            </motion.span>
          </AnimatePresence>

          <button
            onClick={nextMonth}
            className="w-5 h-5 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Weekday row — mini */}
        <div className="grid grid-cols-7 bg-blue-50 dark:bg-slate-800">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-0.5 text-center text-[8px] font-bold text-blue-500 dark:text-blue-400 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid — mini */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${viewYear}-${viewMonth}-grid`}
            initial={{ x: direction * 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -30, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-7 p-1 gap-px bg-white dark:bg-slate-900"
          >
            {calCells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const past = isPast(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <motion.button
                  key={`d-${day}`}
                  onClick={() => handleDayClick(day)}
                  disabled={past}
                  whileHover={!past ? { scale: 1.18 } : {}}
                  whileTap={!past ? { scale: 0.88 } : {}}
                  className={`
                    w-full aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all
                    ${sel ? 'bg-blue-600 text-white shadow-md shadow-blue-300 dark:shadow-blue-900' : ''}
                    ${!sel && tod ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-400' : ''}
                    ${!sel && !tod && !past ? 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700' : ''}
                    ${past ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {day}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── TIME PICKER ──────────────────────────────────────────────── */}
      <div className={`rounded-xl border overflow-hidden shadow-sm transition-all duration-300 ${
        selectedDate
          ? 'border-blue-300 dark:border-blue-700'
          : 'border-slate-200 dark:border-slate-700 opacity-50 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-between">
          <span className="text-white font-bold text-xs">Select Time</span>
          {selectedDate && (
            <span className="text-white/80 text-[10px]">
              {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-3">

          {/* Column labels */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 w-12 text-center">Hours</span>
            <span className="w-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 w-12 text-center">Minutes</span>
            <span className="w-16" />
          </div>

          {/* Spinners row */}
          <div className="flex items-center justify-center gap-3">

            {/* Hours */}
            <div className="flex flex-col items-center gap-0.5">
              <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                onClick={() => adjustHour(-1)}
                className="w-8 h-7 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={hours12}
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="w-12 h-11 flex items-center justify-center text-2xl font-black text-blue-700 dark:text-white bg-blue-50 dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-slate-700"
                >
                  {String(hours12).padStart(2, '0')}
                </motion.div>
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                onClick={() => adjustHour(1)}
                className="w-8 h-7 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Colon */}
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-2xl font-black text-blue-500 dark:text-blue-400 mb-0.5"
            >
              :
            </motion.span>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-0.5">
              <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                onClick={() => adjustMinute(-1)}
                className="w-8 h-7 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={minutes}
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="w-12 h-11 flex items-center justify-center text-2xl font-black text-blue-700 dark:text-white bg-blue-50 dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-slate-700"
                >
                  {String(minutes).padStart(2, '0')}
                </motion.div>
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                onClick={() => adjustMinute(1)}
                className="w-8 h-7 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            {/* AM / PM toggle */}
            <div className="flex flex-col gap-1 ml-1">
              {(['AM', 'PM'] as const).map(ap => (
                <motion.button
                  key={ap}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { setAmpm(ap); emit(selectedDate, hours12, minutes, ap); }}
                  className={`w-12 h-[42px] rounded-xl text-xs font-black transition-all ${
                    ampm === ap
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-300 dark:shadow-blue-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {ap}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Min time hint */}
          {minTimeLabel && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium"
            >
              ⏱ Earliest today: {minTimeLabel}
            </motion.p>
          )}
        </div>
      </div>

      {/* ── QUICK SLOT CHIPS (after 1hr) ──────────────────────────────── */}
      {selectedDate && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
            ⚡ Quick Time Slots (from +1 hr)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickSlots.map(slot => {
              const isActive =
                hours12 === (slot.h24 % 12 === 0 ? 12 : slot.h24 % 12) &&
                minutes === slot.min &&
                ampm === (slot.h24 < 12 ? 'AM' : 'PM');
              return (
                <motion.button
                  key={slot.label}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => applyQuickSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-300 dark:shadow-blue-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {slot.label}
                </motion.button>
              );
            })}
          </div>
          {/* Delivery hours notice */}
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1"
          >
            <span>🌙</span>
            <span>Delivery available <strong className="text-slate-500 dark:text-slate-400">6:00 AM – 10:00 PM</strong> only. No deliveries between 10 PM &amp; 6 AM.</span>
          </motion.p>
        </div>
      )}
    </div>
  );
};

export default DeliveryScheduler;
