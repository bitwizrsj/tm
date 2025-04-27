let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentSort = 'none';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const priorityInput = document.getElementById('priorityInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const sortPriority = document.getElementById('sortPriority');

const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const pendingTasks = document.getElementById('pendingTasks');
const todayTasks = document.getElementById('todayTasks');

document.getElementById('darkToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
});

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!taskInput.value.trim()) return;

  const newTask = {
    id: Date.now(),
    text: taskInput.value,
    date: dateInput.value || new Date().toISOString().split('T')[0],
    priority: priorityInput.value,
    completed: false
  };

  tasks.push(newTask);
  saveAndRender();
  taskForm.reset();
});

function renderTasks() {
  taskList.innerHTML = '';

  let filteredTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    if (currentFilter === 'today') return task.date === today;
    if (currentFilter === 'upcoming') return task.date > today;
    if (currentFilter === 'overdue') return task.date < today && !task.completed;
    return true;
  });

  if (searchInput.value.trim()) {
    filteredTasks = filteredTasks.filter(task =>
      task.text.toLowerCase().includes(searchInput.value.trim().toLowerCase())
    );
  }

  if (currentSort === 'high') {
    filteredTasks.sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority));
  } else if (currentSort === 'low') {
    filteredTasks.sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority));
  }

  filteredTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `task-card p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center`;

    const badgeColor = task.priority === 'High' ? 'bg-red-500' :
                       task.priority === 'Medium' ? 'bg-yellow-500' :
                       'bg-green-500';

    div.innerHTML = `
      <div>
        <h3 class="font-semibold ${task.completed ? 'line-through text-gray-400' : ''}">${task.text}</h3>
        <p class="text-sm text-gray-500 flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full ${badgeColor}"></span> 
          ${task.priority} | ${task.date}
        </p>
      </div>
      <div class="flex gap-2 text-lg">
        <button onclick="toggleComplete(${task.id})" title="${task.completed ? 'Undo' : 'Done'}">
          <i data-feather="${task.completed ? 'rotate-ccw' : 'check'}"></i>
        </button>
        <button onclick="editTask(${task.id})" title="Edit">
          <i data-feather="edit"></i>
        </button>
        <button onclick="deleteTask(${task.id})" title="Delete">
          <i data-feather="trash-2"></i>
        </button>
      </div>
    `;
    taskList.appendChild(div);
  });

  feather.replace(); // re-render icons
}

function priorityValue(priority) {
  if (priority === 'High') return 3;
  if (priority === 'Medium') return 2;
  return 1;
}

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateStats();
  renderTasks();
}

function updateStats() {
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(task => task.completed).length;
  pendingTasks.textContent = tasks.filter(task => !task.completed).length;
  todayTasks.textContent = tasks.filter(task => task.date === new Date().toISOString().split('T')[0]).length;
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt('Edit task', task.text);
  if (newText !== null && newText.trim()) {
    task.text = newText.trim();
    saveAndRender();
  }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.getAttribute('data-filter');
    renderTasks();
  });
});

searchInput.addEventListener('input', renderTasks);

sortPriority.addEventListener('change', () => {
  currentSort = sortPriority.value;
  renderTasks();
});

saveAndRender();
