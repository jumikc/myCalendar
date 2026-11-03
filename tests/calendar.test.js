const test = require("node:test");
const assert = require("node:assert/strict");
const { dayInfo, monthGrid } = require("../js/model.js");

test("2026-10-30 is lunar 九月廿一 in the year of the horse", function () {
  const info = dayInfo(2026, 10, 30);
  assert.equal(info.weekdayLabel, "星期五");
  assert.equal(info.lunarLine, "农历九月廿一");
  assert.equal(info.ganzhiLine, "丙午年·属马");
  assert.equal(info.badge, null);
  assert.deepEqual(info.lines.map(function (line) { return line.text; }), ["廿一"]);
});

test("National Day shows the lunar day, the holiday name, and a rest badge", function () {
  const info = dayInfo(2026, 10, 1);
  assert.equal(info.weekdayLabel, "星期四");
  assert.equal(info.lunarLine, "农历八月廿一");
  assert.equal(info.badge, "rest");
  assert.deepEqual(info.lines.map(function (line) { return line.text; }), ["廿一", "国庆节"]);
  assert.deepEqual(info.chips.map(function (chip) { return chip.text; }), ["国庆节", "放假"]);
});

test("solar terms, the Double Ninth Festival, Halloween, and the make-up workday", function () {
  assert.equal(dayInfo(2026, 10, 8).lines[0].text, "寒露");
  assert.equal(dayInfo(2026, 10, 8).lines[0].kind, "term");
  assert.equal(dayInfo(2026, 10, 23).lines[0].text, "霜降");
  assert.equal(dayInfo(2026, 11, 7).lines[0].text, "立冬");
  assert.equal(dayInfo(2026, 10, 18).lines[0].text, "重阳节");
  assert.equal(dayInfo(2026, 10, 31).lines[0].text, "万圣节");
  const makeup = dayInfo(2026, 10, 10);
  assert.equal(makeup.badge, "work");
  assert.equal(makeup.lines[0].text, "九月");
  assert.equal(dayInfo(2026, 10, 11).lines[0].text, "初二");
  assert.deepEqual(dayInfo(2026, 10, 5).lines.map(function (line) { return line.text; }), ["廿五"]);
});

test("October 2026 grid starts on Monday 28 September and keeps six weeks", function () {
  const cells = monthGrid(2026, 10);
  assert.equal(cells.length, 42);
  assert.deepEqual([cells[0].month, cells[0].day, cells[0].inMonth], [9, 28, false]);
  assert.equal(cells[3].iso, "2026-10-01");
  assert.equal(cells[3].inMonth, true);
  assert.equal(cells[41].iso, "2026-11-08");
  assert.equal(cells[41].inMonth, false);
});
