(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.CalendarModel = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const lunarLib = (typeof module === "object" && module.exports)
    ? require("../vendor/lunar.js")
    : { Solar: globalThis.Solar, HolidayUtil: globalThis.HolidayUtil };
  const Solar = lunarLib.Solar;
  const HolidayUtil = lunarLib.HolidayUtil;
  const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const SOLAR_FESTIVALS = {
    "元旦节": "元旦节",
    "情人节": "情人节",
    "妇女节": "妇女节",
    "植树节": "植树节",
    "消费者权益日": "消费者权益日",
    "愚人节": "愚人节",
    "劳动节": "劳动节",
    "青年节": "青年节",
    "儿童节": "儿童节",
    "建党节": "建党节",
    "建军节": "建军节",
    "教师节": "教师节",
    "国庆节": "国庆节",
    "万圣节前夜": "万圣节",
    "万圣节": "万圣节",
    "平安夜": "平安夜",
    "圣诞节": "圣诞节"
  };

  function solarFestivalName(names) {
    for (let i = 0; i < names.length; i++) {
      if (SOLAR_FESTIVALS[names[i]]) return SOLAR_FESTIVALS[names[i]];
    }
    return "";
  }

  function lunarDayLabel(lunar) {
    if (lunar.getDay() === 1) return lunar.getMonthInChinese() + "月";
    return lunar.getDayInChinese();
  }

  function iso(y, m, d) {
    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function dayInfo(y, m, d) {
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    const holiday = HolidayUtil.getHoliday(y, m, d);
    const jieqi = lunar.getJieQi() || "";
    const lunarFest = (lunar.getFestivals() || [])[0] || "";
    const solarFest = solarFestivalName(solar.getFestivals() || []);
    const holidayName = holiday ? holiday.getName() : "";
    const dateId = iso(y, m, d);
    const isTargetHoliday = !!(holiday && !holiday.isWork() && holiday.getTarget() === dateId);
    const lines = [];

    if (jieqi) {
      lines.push({ text: jieqi, kind: "term" });
    } else if (lunarFest) {
      lines.push({ text: lunarFest, kind: "fest" });
    } else if (solarFest && !(isTargetHoliday && solarFest === holidayName)) {
      lines.push({ text: solarFest, kind: "fest" });
    } else {
      lines.push({ text: lunarDayLabel(lunar), kind: "lunar" });
    }

    if (isTargetHoliday && !lines.some(function (line) {
      return line.text === holidayName || holidayName.indexOf(line.text) === 0;
    })) {
      lines.push({ text: holidayName, kind: "fest" });
    }

    const chips = [];
    const seen = [];
    function addChip(text, kind) {
      if (!text) return;
      for (let i = 0; i < seen.length; i++) {
        const prev = seen[i];
        if (prev === text || prev.indexOf(text) === 0 || text.indexOf(prev) === 0) return;
      }
      seen.push(text);
      chips.push({ text: text, kind: kind });
    }
    if (holidayName) addChip(holidayName, "fest");
    if (lunarFest) addChip(lunarFest, "fest");
    if (solarFest) addChip(solarFest, "fest");
    if (jieqi) addChip(jieqi, "term");
    if (holiday) addChip(holiday.isWork() ? "上班" : "放假", holiday.isWork() ? "work" : "off");

    const week = solar.getWeek();
    return {
      year: y,
      month: m,
      day: d,
      iso: dateId,
      weekday: week,
      weekdayLabel: WEEKDAYS[week],
      isWeekend: week === 0 || week === 6,
      lines: lines,
      badge: holiday ? (holiday.isWork() ? "work" : "rest") : null,
      lunarLine: "农历" + lunar.getMonthInChinese() + "月" + lunar.getDayInChinese(),
      ganzhiLine: lunar.getYearInGanZhi() + "年·属" + lunar.getYearShengXiao(),
      solarLine: m + "月" + d + "日",
      chips: chips
    };
  }

  function monthGrid(year, month) {
    const first = new Date(year, month - 1, 1);
    const lead = (first.getDay() + 6) % 7;
    const start = new Date(year, month - 1, 1 - lead);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const y = dt.getFullYear();
      const m = dt.getMonth() + 1;
      const d = dt.getDate();
      const info = dayInfo(y, m, d);
      info.inMonth = y === year && m === month;
      cells.push(info);
    }
    return cells;
  }

  return {
    WEEKDAYS: WEEKDAYS,
    dayInfo: dayInfo,
    monthGrid: monthGrid
  };
});
