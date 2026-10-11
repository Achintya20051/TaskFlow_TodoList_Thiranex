const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const filters = document.getElementById("filters");
const taskCount = document.getElementById("taskCount");
const clearCompleted = document.getElementById("clearCompleted");

let tasks = [];
let currentFilter = "all";

// Restore saved tasks when the page loads.
try {
  const savedTasks = JSON.parse(
    window.localStorage.getItem("taskflow-tasks") || "[]"
  );

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  }
} catch (error) {
  tasks = [];
}

// Save the current state to localStorage.
function saveTasks() {
  try {
    window.localStorage.setItem(
      "taskflow-tasks",
      JSON.stringify(tasks)
    );
  } catch (error) {
    alert("Unable to save tasks in this browser.");
  }
}

// Read state and render the visible tasks.
function renderTasks() {
  taskList.replaceChildren();

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty";
    emptyMessage.textContent = "No tasks to display.";
    taskList.appendChild(emptyMessage);
  }

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task";

    if (task.completed) {
      li.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.dataset.id = task.id;
    checkbox.setAttribute("aria-label", "Mark task completed");

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = task.id;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = task.id;

    actions.append(editButton, deleteButton);
    li.append(checkbox, text, actions);
    taskList.appendChild(li);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  taskCount.textContent =
    remaining + (remaining === 1 ? " task left" : " tasks left");

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === currentFilter
    );
  });
}

// CREATE: add a new task.
taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    text,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

// FILTER: All, Active, or Completed.
filters.addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;
  renderTasks();
});

// UPDATE and DELETE: delegated click listener.
taskList.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const task = tasks.find(item => item.id === button.dataset.id);
  if (!task) return;

  if (button.dataset.action === "edit") {
    const updatedText = prompt("Edit your task:", task.text);

    if (updatedText !== null && updatedText.trim()) {
      task.text = updatedText.trim().slice(0, 200);
      saveTasks();
      renderTasks();
    }
  }

  if (
    button.dataset.action === "delete" &&
    confirm("Delete this task?")
  ) {
    tasks = tasks.filter(item => item.id !== button.dataset.id);
    saveTasks();
    renderTasks();
  }
});

// UPDATE: toggle task completion using event delegation.
taskList.addEventListener("change", event => {
  const checkbox = event.target.closest('input[data-action="toggle"]');
  if (!checkbox) return;

  const task = tasks.find(item => item.id === checkbox.dataset.id);
  if (!task) return;

  task.completed = checkbox.checked;
  saveTasks();
  renderTasks();
});

// Delete all completed tasks.
clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

// Initial render.
renderTasks();
