document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".input-task");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("tasks");
  const emptyImg = document.querySelector(".empty-image");

  // Hàm đồng bộ trạng thái ảnh trống
  const syncEmpty = () => {
    // Ẩn ảnh nếu có ít nhất 1 <li>, ngược lại hiện
    emptyImg.classList.toggle("hidden", taskList.children.length > 0);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const li = document.createElement("li");
    li.className = "task";
    li.innerHTML = `
        <button class="chk"></button>
        <div class="title">${text}</div>
        <div class="actions">
          <button class="icon-btn edit">✎</button>
          <button class="icon-btn del">🗑</button>
        </div>
      `;

    li.querySelector(".chk").addEventListener("click", () => {
      li.classList.toggle("done");
    });
    li.querySelector(".del").addEventListener("click", () => {
      li.remove();
      syncEmpty(); // cập nhật khi xóa
    });

    taskList.appendChild(li);
    taskInput.value = "";
    taskInput.focus();
    syncEmpty(); // cập nhật khi thêm
  });

  syncEmpty(); // cập nhật lúc load trang
});
