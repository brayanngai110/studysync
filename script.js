const STORAGE_KEY = "studysync-tasks";

let tasks = loadTasks();

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("taskName").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const difficulty = Number.parseInt(document.getElementById("difficulty").value, 10);

  if (!name) {
    return;
  }

  tasks.push({
    id: Date.now(),
    name,
    dueDate,
    difficulty,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  document.getElementById("difficulty").value = "3";
});

function renderTasks() {
  taskList.innerHTML = "";

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  if (sortedTasks.length === 0) {
    taskList.innerHTML = '<p class="empty-state">No tasks yet. Add your first one to get started.</p>';
    return;
  }

  sortedTasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = `task-card${task.completed ? " completed" : ""}`;

    const status = task.completed ? "Completed" : "Open";
    const dueText = formatDueDate(task.dueDate);

    card.innerHTML = `
      <div class="task-top">
        <div>
          <h3>${escapeHtml(task.name)}</h3>
          <p class="task-meta">
            Due: ${dueText}<br />
            Difficulty: ${task.difficulty}/5
          </p>
        </div>
        <span class="status-chip">${status}</span>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    if (!task.completed) {
      const completeButton = document.createElement("button");
      completeButton.className = "secondary-btn";
      completeButton.textContent = "Mark Complete";
      completeButton.addEventListener("click", () => {
        task.completed = true;
        saveTasks();
        renderTasks();
      });
      actions.appendChild(completeButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "danger-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      saveTasks();
      renderTasks();
    });
    actions.appendChild(deleteButton);

    card.appendChild(actions);
    taskList.appendChild(card);
  });
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    return JSON.parse(savedTasks);
  } catch (error) {
    console.error("Could not load tasks.", error);
    return [];
  }
}

function formatDueDate(value) {
  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

renderTasks();
