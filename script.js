// ===========================================================
// Me To-Do List - script.js (clean structure + comments + localStorage)
// ===========================================================

// ---------- 0) Config ----------
const MAX_TITLE = 30; // Giới hạn ký tự khi SUBMIT (add hoặc edit)
const STORAGE_KEY = "me-todo:v1"; // Key lưu trong localStorage

// ---------- 1) App bootstrap ----------
document.addEventListener("DOMContentLoaded", init);

/**
 * Khởi tạo ứng dụng: lấy DOM refs, bind events, render lần đầu.
 */
function init() {
  const refs = {
    // Input & List
    form: document.querySelector(".input-area"),
    taskInput: document.getElementById("task-input"),
    addBtn: document.getElementById("add-task-btn"),
    taskList: document.getElementById("task-list"),
    emptyImg: document.querySelector(".empty-image"),

    // Stats
    doneCountEl: document.getElementById("done-count"),
    totalCountEl: document.getElementById("total-count"),
    barFillEl: document.getElementById("bar-fill"),

    // Error message
    errEl: document.getElementById("title-error"),

    // Edit state
    editingLi: null,
    prevBtnIconHTML: null,

    // celebrate when done all
    fireworksShown: false,
  };

  // 1.1) Load từ localStorage
  const state = loadState();
  renderFromState(refs, state);

  // 1.2) Gắn event listeners
  bindEvents(refs);

  // 1.3) Render lần đầu
  syncEmpty(refs);
  updateStats(refs);
}

// ---------- 1b) LocalStorage helpers ----------
/** Đọc dữ liệu từ localStorage */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Lưu danh sách hiện tại vào localStorage */
function saveState(taskList) {
  const data = [];
  taskList.querySelectorAll(".task").forEach((li) => {
    data.push({
      title: li.querySelector(".title")?.textContent || "",
      done: li.querySelector(".chk")?.classList.contains("done") || false,
    });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Render toàn bộ từ state (mảng {title, done}) */
function renderFromState(refs, tasks) {
  refs.taskList.innerHTML = "";
  tasks.forEach((t) => {
    const li = makeTask(t.title, t.done);
    refs.taskList.appendChild(li);
  });
}

// ---------- 2) Pure helpers ----------
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
  );
}

function checkTruncated(el) {
  if (!el) return;
  if (el.scrollWidth > el.clientWidth) {
    el.classList.add("truncated");
    el.dataset.full = el.textContent;
  } else {
    el.classList.remove("truncated");
    delete el.dataset.full;
  }
}

function makeTask(title, done = false) {
  const li = document.createElement("li");
  li.className = "task";
  li.innerHTML = `
    <button type="button" class="chk ${
      done ? "done" : ""
    }" data-action="toggle" aria-label="toggle">
      ${done ? '<i class="fa-solid fa-check"></i>' : ""}
    </button>
    <div class="title" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
    <div class="actions">
      <button type="button" class="icon-btn edit" data-action="edit" aria-label="edit">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button type="button" class="icon-btn del" data-action="delete" aria-label="delete">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
  const titleEl = li.querySelector(".title");
  requestAnimationFrame(() => checkTruncated(titleEl));
  return li;
}

// ---------- 3) UI sync helpers ----------
function syncEmpty({ emptyImg, taskList }) {
  if (!emptyImg) return;
  emptyImg.style.display = taskList.children.length ? "none" : "block";
}

function updateStats(refs) {
  const { taskList, doneCountEl, totalCountEl, barFillEl } = refs;
  const total = taskList.querySelectorAll(".task").length;
  const done = taskList.querySelectorAll(".chk.done").length;

  if (totalCountEl) totalCountEl.textContent = total;
  if (doneCountEl) doneCountEl.textContent = done;

  const pct = total ? Math.round((done / total) * 100) : 0;
  if (barFillEl) barFillEl.style.width = pct + "%";

  maybeFireworks(refs, { pct, total, done });
}

// Chỉ bắn khi 100% & có ít nhất 1 task; reset cờ khi không còn 100%
function maybeFireworks(refs, { pct, total }) {
  if (pct === 100 && total > 0) {
    if (!refs.fireworksShown) {
      refs.fireworksShown = true;
      launchFireworks();
    }
  } else {
    refs.fireworksShown = false;
  }
}

// Hiệu ứng pháo hoa (canvas-confetti)
function launchFireworks() {
  if (typeof confetti !== "function") return; // phòng khi chưa load lib

  const duration = 2.2 * 1000; // 2.2s
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 90, zIndex: 9999 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    // 2 luồng bắn từ hai bên, mỗi lần một ít hạt
    confetti({
      ...defaults,
      particleCount: 40,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() * 0.3 + 0.1 },
    });
    confetti({
      ...defaults,
      particleCount: 40,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() * 0.3 + 0.1 },
    });
  }, 180);

  // cú nổ giữa màn để “kết thúc”
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 180,
      spread: 70,
      origin: { y: 0.4 },
    });
  }, duration - 200);
}

function showError(refs, msg) {
  const { errEl, taskInput } = refs;
  if (!errEl) return;

  if (msg) {
    errEl.textContent = msg;
    errEl.hidden = false;
    taskInput.classList.add("is-invalid");
  } else {
    errEl.textContent = "";
    errEl.hidden = true;
    taskInput.classList.remove("is-invalid");
  }
}

// ---------- 4) Edit mode helpers ----------
function enterEditMode(refs, li) {
  const { taskInput, addBtn } = refs;
  const titleEl = li.querySelector(".title");

  refs.editingLi = li;
  if (refs.prevBtnIconHTML == null) refs.prevBtnIconHTML = addBtn.innerHTML;
  addBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  addBtn.setAttribute("aria-label", "Save task");

  taskInput.value = titleEl.textContent;
  taskInput.focus();
  taskInput.setSelectionRange(taskInput.value.length, taskInput.value.length);
  showError(refs, "");
}

function exitEditMode(refs) {
  const { taskInput, addBtn } = refs;
  refs.editingLi = null;
  taskInput.value = "";
  showError(refs, "");

  addBtn.innerHTML = refs.prevBtnIconHTML ?? '<i class="fa-solid fa-plus"></i>';
  addBtn.setAttribute("aria-label", "Add task");
}

// ---------- 5) Events ----------
function bindEvents(refs) {
  refs.form.addEventListener("submit", (e) => onSubmit(e, refs));
  refs.addBtn.addEventListener("click", () => refs.form.requestSubmit());
  refs.taskList.addEventListener("click", (e) => onListClick(e, refs));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && refs.editingLi) exitEditMode(refs);
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".task .title").forEach(checkTruncated);
  });
}

// ---------- 6) Handlers ----------
function onSubmit(event, refs) {
  event.preventDefault();
  const { taskInput, taskList, editingLi } = refs;

  const text = taskInput.value.trim();
  if (!text) return;

  if (text.length > MAX_TITLE) {
    showError(
      refs,
      `Tiêu đề tối đa ${MAX_TITLE} ký tự (hiện tại ${text.length}).`
    );
    taskInput.focus();
    return;
  }
  showError(refs, "");

  if (editingLi) {
    const titleEl = editingLi.querySelector(".title");
    titleEl.textContent = text;
    titleEl.setAttribute("title", text);
    checkTruncated(titleEl);
    exitEditMode(refs);
  } else {
    const li = makeTask(text, false);
    taskList.appendChild(li);
  }

  taskInput.value = "";
  taskInput.focus();

  syncEmpty(refs);
  updateStats(refs);
  saveState(taskList); // <-- lưu sau mỗi submit
}

function onListClick(event, refs) {
  const { taskList } = refs;
  const li = event.target.closest(".task");
  if (!li || !taskList.contains(li)) return;

  const btn = event.target.closest("button");
  if (!btn) return;

  const action =
    btn.dataset.action ||
    (btn.classList.contains("edit")
      ? "edit"
      : btn.classList.contains("del")
      ? "delete"
      : btn.classList.contains("chk")
      ? "toggle"
      : "");

  if (action === "toggle") {
    const chk = li.querySelector(".chk");
    chk.classList.toggle("done");
    chk.innerHTML = chk.classList.contains("done")
      ? '<i class="fa-solid fa-check"></i>'
      : "";
    updateStats(refs);
    saveState(taskList);
    return;
  }

  if (action === "delete") {
    if (refs.editingLi && refs.editingLi === li) exitEditMode(refs);
    li.remove();
    syncEmpty(refs);
    updateStats(refs);
    saveState(taskList);
    return;
  }

  if (action === "edit") {
    enterEditMode(refs, li);
    return;
  }
}
