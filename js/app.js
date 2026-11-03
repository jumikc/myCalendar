(function () {
  const model = window.CalendarModel;
  const gridEl = document.getElementById("grid");
  const detailEl = document.getElementById("detail");
  const yearEl = document.getElementById("year");
  const monthEl = document.getElementById("month");

  const todayDate = new Date();
  const today = {
    y: todayDate.getFullYear(),
    m: todayDate.getMonth() + 1,
    d: todayDate.getDate()
  };

  let viewYear = today.y;
  let viewMonth = today.m;
  let selected = today.y + "-" + pad(today.m) + "-" + pad(today.d);

  const hash = /^#(\d{4})-(\d{2})-(\d{2})$/.exec(location.hash || "");
  if (hash) {
    const y = Number(hash[1]);
    const m = Number(hash[2]);
    const d = Number(hash[3]);
    const probe = new Date(y, m - 1, d);
    if (probe.getFullYear() === y && probe.getMonth() === m - 1 && probe.getDate() === d) {
      viewYear = y;
      viewMonth = m;
      selected = y + "-" + pad(m) + "-" + pad(d);
    }
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function isToday(cell) {
    return cell.year === today.y && cell.month === today.m && cell.day === today.d;
  }

  function render() {
    yearEl.textContent = String(viewYear);
    monthEl.textContent = viewMonth + "月";
    const cells = model.monthGrid(viewYear, viewMonth);
    gridEl.replaceChildren();
    cells.forEach(function (cell) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day";
      if (!cell.inMonth) btn.classList.add("is-out");
      if (cell.isWeekend && cell.inMonth) btn.classList.add("is-weekend");
      if (isToday(cell)) btn.classList.add("is-today");
      if (cell.iso === selected) btn.classList.add("is-selected");
      btn.setAttribute("aria-pressed", cell.iso === selected ? "true" : "false");
      btn.setAttribute("aria-label", cell.year + "年" + cell.solarLine + " " + cell.weekdayLabel + " " + cell.lunarLine);

      const num = document.createElement("span");
      num.className = "num";
      num.textContent = String(cell.day);
      btn.appendChild(num);

      cell.lines.forEach(function (line) {
        const sub = document.createElement("span");
        sub.className = "sub " + line.kind;
        sub.textContent = line.text;
        btn.appendChild(sub);
      });

      if (cell.badge) {
        const badge = document.createElement("span");
        badge.className = "badge " + cell.badge;
        badge.textContent = cell.badge === "work" ? "班" : "休";
        btn.appendChild(badge);
      }

      btn.addEventListener("click", function () {
        if (!cell.inMonth) {
          viewYear = cell.year;
          viewMonth = cell.month;
        }
        selected = cell.iso;
        render();
      });
      gridEl.appendChild(btn);
    });
    renderDetail();
  }

  function renderDetail() {
    const parts = selected.split("-");
    const info = model.dayInfo(Number(parts[0]), Number(parts[1]), Number(parts[2]));
    const todayMark = info.year === today.y && info.month === today.m && info.day === today.d;
    detailEl.replaceChildren();

    const kicker = document.createElement("div");
    kicker.className = "kicker";
    const week = document.createElement("span");
    week.textContent = info.weekdayLabel;
    kicker.appendChild(week);
    if (todayMark) {
      const chip = document.createElement("span");
      chip.className = "mini-today";
      chip.textContent = "今天";
      kicker.appendChild(chip);
    }
    detailEl.appendChild(kicker);

    const title = document.createElement("h2");
    title.textContent = info.solarLine;
    detailEl.appendChild(title);

    const lunar = document.createElement("p");
    lunar.className = "lunar-line";
    lunar.textContent = info.lunarLine;
    detailEl.appendChild(lunar);

    const gz = document.createElement("p");
    gz.className = "gz-line";
    gz.textContent = info.ganzhiLine;
    detailEl.appendChild(gz);

    if (info.chips.length) {
      const row = document.createElement("div");
      row.className = "chips";
      info.chips.forEach(function (chip) {
        const el = document.createElement("span");
        el.className = "chip " + chip.kind;
        el.textContent = chip.text;
        row.appendChild(el);
      });
      detailEl.appendChild(row);
    }
  }

  function shiftMonth(delta) {
    const dt = new Date(viewYear, viewMonth - 1 + delta, 1);
    viewYear = dt.getFullYear();
    viewMonth = dt.getMonth() + 1;
    const picked = selected.split("-");
    const wanted = Number(picked[2]);
    const last = new Date(viewYear, viewMonth, 0).getDate();
    const day = Math.min(wanted, last);
    selected = viewYear + "-" + pad(viewMonth) + "-" + pad(day);
    render();
  }

  document.getElementById("prev").addEventListener("click", function () { shiftMonth(-1); });
  document.getElementById("next").addEventListener("click", function () { shiftMonth(1); });
  document.getElementById("today").addEventListener("click", function () {
    viewYear = today.y;
    viewMonth = today.m;
    selected = today.y + "-" + pad(today.m) + "-" + pad(today.d);
    render();
  });

  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(function () {});
  }
})();
