const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskCounter = document.getElementById("task-counter");
const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.getElementById("clear-completed");

const STORAGE_KEY = "todo-list-tasks";
let tasks = loadTasks();
let activeFilter = "all";

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (task) =>
        typeof task === "object" &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean"
    );
  } catch (error) {
    console.warn("タスクの読み込みに失敗しました", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  if (task.completed) {
    item.classList.add("task-item--completed");
  }
  item.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-item__checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `${task.text} を完了にする`);

  const label = document.createElement("p");
  label.className = "task-item__label";
  label.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task-item__delete";
  deleteButton.textContent = "削除";

  item.append(checkbox, label, deleteButton);
  return item;
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });

  const taskCount = tasks.length;
  taskCounter.textContent = `${taskCount} 件のタスク`;

  const hasVisibleTasks = visibleTasks.length > 0;
  taskList.toggleAttribute("hidden", !hasVisibleTasks);
  emptyState.toggleAttribute("hidden", hasVisibleTasks);
}

function addTask(text) {
  const task = {
    id: crypto.randomUUID(),
    text,
    completed: false,
  };
  tasks = [task, ...tasks];
  saveTasks();
  renderTasks();
}

function toggleTaskCompletion(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  const hasCompleted = tasks.some((task) => task.completed);
  if (!hasCompleted) return;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  addTask(value);
  taskInput.value = "";
  taskInput.focus();
});

taskList.addEventListener("click", (event) => {
  const item = event.target.closest(".task-item");
  if (!item) return;
  const id = item.dataset.id;

  if (event.target.matches(".task-item__checkbox")) {
    toggleTaskCompletion(id);
  }

  if (event.target.matches(".task-item__delete")) {
    deleteTask(id);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("is-active"));
    button.classList.add("is-active");
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", clearCompletedTasks);

renderTasks();
