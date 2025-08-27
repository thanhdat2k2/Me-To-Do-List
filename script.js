document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".input-area");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const emptyImg = document.querySelector(".empty-image");

  // Escape để an toàn khi người dùng gõ ký tự đặc biệt
  const escapeHtml = (s) =>
    s.replace(
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

  // Hiển thị/ẩn hình empty
  const syncEmpty = () => {
    if (!emptyImg) return;
    emptyImg.style.display = taskList.children.length ? "none" : "block";
  };

  // Tạo 1 task (HTML trong JS)
  function makeTask(title, done = false) {
    const li = document.createElement("li");
    li.className = "task";
    li.innerHTML = `
        <button class="chk ${done ? "done" : ""}" aria-label="toggle">
          ${done ? '<i class="fa-solid fa-check"></i>' : ""}
        </button>
        <div class="title">${escapeHtml(title)}</div>
        <div class="actions">
          <button class="icon-btn edit" aria-label="edit"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn del" aria-label="delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
    return li;
  }

  // Thêm task
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const li = makeTask(text);
    taskList.appendChild(li);

    taskInput.value = "";
    taskInput.focus();
    syncEmpty();
  });

  // Nút + gọi submit form
  document
    .getElementById("add-task-btn")
    .addEventListener("click", () => form.requestSubmit());

  // Ủy quyền sự kiện: toggle / edit / delete (chỉ gắn 1 lần)
  taskList.addEventListener("click", (e) => {
    const li = e.target.closest(".task");
    if (!li) return;

    // Toggle check
    if (e.target.closest(".chk")) {
      const chk = li.querySelector(".chk");
      chk.classList.toggle("done");
      chk.innerHTML = chk.classList.contains("done")
        ? '<i class="fa-solid fa-check"></i>'
        : "";
      return;
    }

    // Xóa
    if (e.target.closest(".del")) {
      li.remove();
      syncEmpty();
      return;
    }

    // Sửa
    if (e.target.closest(".edit")) {
      const t = li.querySelector(".title");
      const newText = prompt("Edit task:", t.textContent);
      if (newText !== null) t.textContent = newText.trim();
    }
  });

  syncEmpty();
});
