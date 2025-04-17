// Sélectionne l'élément UL qui contient les tâches
const taskList = document.querySelector("#taskList");

// Fonction pour créer une tâche avec tous les comportements intégrés
function createTaskElement(task) {
  const li = document.createElement("li");
  li.setAttribute("data-id", task.id);

  const statusSpan = document.createElement("span");
  statusSpan.textContent = task.completed ? "✓" : "✗";
  statusSpan.style.marginRight = "10px";
  li.appendChild(statusSpan);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = task.name;
  nameSpan.classList.add("task-name");
  li.appendChild(nameSpan);

  // Double-clic pour édition
  nameSpan.addEventListener("dblclick", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.name;
    input.classList.add("edit-input");

    li.replaceChild(input, nameSpan);
    input.focus();

    const save = async () => {
      const newName = input.value.trim();
      if (newName && newName !== task.name) {
        const res = await fetch(`/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName,
            completed: task.completed, // 🛠 on garde le statut actuel
          }),
        });

        if (res.ok) {
          task.name = newName;
          nameSpan.textContent = newName;
        } else {
          alert("Erreur lors de la mise à jour du nom.");
        }
      }
      li.replaceChild(nameSpan, input);
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") li.replaceChild(nameSpan, input);
    });
  });

  const completeBtn = document.createElement("button");
  completeBtn.textContent = " Terminer";
  completeBtn.style.marginLeft = "10px";

  completeBtn.addEventListener("click", async () => {
    const newStatus = !task.completed;
    const res = await fetch(`/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newStatus }),
    });
    if (res.ok) {
      task.completed = newStatus;
      statusSpan.textContent = task.completed ? "✓" : "✗";
    } else {
      alert("Erreur lors de la mise à jour de l'état.");
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = " Supprimer";
  deleteBtn.style.marginLeft = "10px";

  deleteBtn.addEventListener("click", async () => {
    const res = await fetch(`/tasks/${task.id}`, { method: "DELETE" });
    if (res.ok) {
      li.remove();
    } else {
      alert("Erreur lors de la suppression.");
    }
  });

  li.appendChild(completeBtn);
  li.appendChild(deleteBtn);
  return li;
}
//------------------------------------
// Attache un écouteur d'événement sur le bouton "Ajouter"
document.getElementById("addTaskBtn").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput");

  if (taskInput.value.trim()) {
    fetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: taskInput.value }),
    })
      .then((response) => response.json())
      .then((task) => {
        taskInput.value = "";
        const li = createTaskElement(task);
        taskList.appendChild(li);
      });
  }
});

// Fonction appelée au chargement pour récupérer les tâches existantes
const fetchTasks = async () => {
  const response = await fetch("/tasks");
  const tasks = await response.json();
  taskList.innerHTML = "";

  for (const task of tasks) {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  }
};

// Appelle la fonction pour charger les tâches dès le début
fetchTasks();

// Fonction de filtrage des tâches
const filterTasks = (status) => {
  const allTasks = document.querySelectorAll("#taskList li");

  allTasks.forEach((taskElement) => {
    const taskStatus = taskElement.querySelector("span").textContent;

    if (
      status === "all" ||
      (status === "completed" && taskStatus === "✓") ||
      (status === "incomplete" && taskStatus === "✗")
    ) {
      taskElement.style.display = "list-item";
    } else {
      taskElement.style.display = "none";
    }
  });
};

// Ajoute les boutons de filtrage
document
  .getElementById("filterAll")
  .addEventListener("click", () => filterTasks("all"));
document
  .getElementById("filterCompleted")
  .addEventListener("click", () => filterTasks("completed"));
document
  .getElementById("filterIncomplete")
  .addEventListener("click", () => filterTasks("incomplete"));

// Dark Mode
const toggleBtn = document.getElementById("darkToggle");
const body = document.body;

const updateTheme = () => {
  const isDark = localStorage.getItem("darkMode") === "true";
  body.classList.toggle("dark", isDark);
  toggleBtn.textContent = isDark ? "☀️" : "🌙";
};

toggleBtn.addEventListener("click", () => {
  const isDark = !(localStorage.getItem("darkMode") === "true");
  localStorage.setItem("darkMode", isDark);
  updateTheme();
});

updateTheme();
//---------------------------------------------------
// Fonction de tri par date de création (plus récent en premier)
const sortByDate = () => {
  const allTasks = document.querySelectorAll("#taskList li");
  const sortedTasks = [...allTasks].sort((a, b) => {
    const dateA = new Date(a.getAttribute("data-id"));
    const dateB = new Date(b.getAttribute("data-id"));
    return dateB - dateA; // Plus récent en premier
  });
  renderTasks(sortedTasks);
};

// Fonction de tri par ordre alphabétique
const sortByAlpha = () => {
  const allTasks = document.querySelectorAll("#taskList li");
  const sortedTasks = [...allTasks].sort((a, b) => {
    const nameA = a.querySelector("span + span").textContent.toLowerCase();
    const nameB = b.querySelector("span + span").textContent.toLowerCase();
    return nameA.localeCompare(nameB); // Trie par ordre alphabétique
  });
  renderTasks(sortedTasks);
};

// Fonction de tri par statut (terminées / en cours)
const sortByStatus = () => {
  const allTasks = document.querySelectorAll("#taskList li");
  const sortedTasks = [...allTasks].sort((a, b) => {
    const statusA = a.querySelector("span").textContent === "✓" ? 1 : 0;
    const statusB = b.querySelector("span").textContent === "✓" ? 1 : 0;
    return statusB - statusA; // Tri par statut (terminées en premier)
  });
  renderTasks(sortedTasks);
};

// Fonction pour réafficher les tâches triées
const renderTasks = (tasks) => {
  taskList.innerHTML = ""; // Vide la liste actuelle
  tasks.forEach((task) => {
    taskList.appendChild(task); // Ajoute les tâches triées
  });
};

// Ajoute l'événement de changement de la liste déroulante
document.getElementById("taskSort").addEventListener("change", (event) => {
  const value = event.target.value;
  if (value === "date") {
    sortByDate();
  } else if (value === "alpha") {
    sortByAlpha();
  } else if (value === "status") {
    sortByStatus();
  }
});
