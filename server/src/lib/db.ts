export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysYmd(ymd: string, deltaDays: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return localDateKey(d);
}

/** 本周（周一至周日）本地日历 [start,end] */
export function currentWeekRangeLocal(): { start: string; end: string } {
  const now = new Date();
  const todayYmd = localDateKey(now);
  const dow = now.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const mondayYmd = addDaysYmd(todayYmd, mondayOffset);
  const sundayYmd = addDaysYmd(mondayYmd, 6);
  return { start: mondayYmd, end: sundayYmd };
}