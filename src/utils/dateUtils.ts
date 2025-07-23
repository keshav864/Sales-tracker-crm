import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const getCurrentMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

export const getMonthDays = (monthStr: string): Date[] => {
  const [year, month] = monthStr.split('-').map(Number);
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  
  return eachDayOfInterval({ start: monthStart, end: monthEnd });
};

export const calculateHours = (checkIn: string, checkOut: string): number => {
  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();
  return (checkOutTime - checkInTime) / (1000 * 60 * 60);
};

export const isCurrentDay = (date: string): boolean => {
  return isToday(parseISO(date));
};

export const isWeekendDay = (date: Date): boolean => {
  return isWeekend(date);
};