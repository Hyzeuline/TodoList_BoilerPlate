// Sélectionne l'élément UL qui contient les tâches
const taskList = document.querySelector("#taskList");

// Fonction pour créer une tâche avec tous les comportements intégrés
function createTaskElement(task) {
  const li = document.createElement("li");
  li.setAttribute("data-id", task.id);
  li.setAttribute("draggable", "true"); // Rendre l'élément draggable

  const statusSpan = document.createElement("span");
  statusSpan.textContent = task.completed ? "✓" : "✗";
  statusSpan.style.color = task.completed ? "green" : "red";
  statusSpan.style.marginRight = "10px";
  li.appendChild(statusSpan);

  const nameSpan = document.createElement("span");
  nameSpan.textContent = task.name;
  nameSpan.classList.add("task-name");
  li.appendChild(nameSpan);

  // Double-clic pour édition
  nameSpan.addEventListener("dblclick", () => {
    const input = document.createElement("input"); // Création d'un champ de saisie pour éditer le nom de la tâche
    input.type = "text";
    input.value = task.name;
    input.classList.add("edit-input");

    li.replaceChild(input, nameSpan); // Remplacement du nom de la tâche par le champ de saisie
    input.focus();

    // Fonction pour sauvegarder la modification du nom de la tâche
    const save = async () => {
      const newName = input.value.trim();
      if (newName && newName !== task.name) {
        const res = await fetch(`/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName,
            completed: task.completed,
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

    // Sauvegarde si la touche "Entrée" est pressée, ou annulation avec "Échap"
    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") li.replaceChild(nameSpan, input);
    });
  });

  // Création du bouton "Terminer"
  const completeBtn = document.createElement("button");
  completeBtn.textContent = " Terminer";
  completeBtn.style.marginLeft = "10px";

  // Ajout d'un événement de clic pour marquer la tâche comme terminée
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
      statusSpan.style.color = task.completed ? "green" : "red";
    } else {
      alert("Erreur lors de la mise à jour de l'état.");
    }
  });

  // Création du bouton "Supprimer"
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = " Supprimer";
  deleteBtn.style.marginLeft = "10px";

  // Ajout d'un événement de clic pour supprimer la tâche
  deleteBtn.addEventListener("click", async () => {
    const res = await fetch(`/tasks/${task.id}`, { method: "DELETE" });
    if (res.ok) {
      li.remove();
    } else {
      alert("Erreur lors de la suppression.");
    }
  });

  // Alignement des boutons à droite
  completeBtn.style.float = "right";
  deleteBtn.style.float = "right";

  li.appendChild(completeBtn);
  li.appendChild(deleteBtn);

  // Ajouter des événements de Drag & Drop
  li.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    setTimeout(() => {
      li.style.opacity = "0.5";
    }, 0);
  });

  li.addEventListener("dragend", () => {
    li.style.opacity = "1";
  });

  taskList.addEventListener("dragover", (e) => {
    e.preventDefault(); // Permet le drop
  });

  taskList.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData("text/plain");
    const draggedTaskElement = document.querySelector(
      `[data-id='${draggedTaskId}']`
    );
    const allTasks = Array.from(taskList.children);
    const currentTaskIndex = allTasks.indexOf(li);
    const draggedTaskIndex = allTasks.indexOf(draggedTaskElement);

    if (currentTaskIndex !== draggedTaskIndex) {
      if (currentTaskIndex < draggedTaskIndex) {
        taskList.insertBefore(draggedTaskElement, li);
      } else {
        taskList.insertBefore(draggedTaskElement, li.nextSibling);
      }

      // Mettre à jour l'ordre des tâches côté serveur (si nécessaire)
      updateTaskOrder();
    }
  });

  return li;
}
const updateTaskOrder = async () => {
  const taskIds = Array.from(taskList.children).map((taskElement) =>
    taskElement.getAttribute("data-id")
  );

  // Mettre à jour l'ordre des tâches sur le serveur
  await fetch("/tasks/order", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: taskIds }),
  });
};
// Attache d'un écouteur d'événement sur le bouton "Ajouter"
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

// Appel de la fonction au chargement pour récupérer les tâches existantes
const fetchTasks = async () => {
  const response = await fetch("/tasks");
  const tasks = await response.json();
  taskList.innerHTML = "";

  for (const task of tasks) {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  }
};

// Appel de la fonction pour charger les tâches dès le début
fetchTasks();

// Fonction de filtrage des tâches
const filterTasks = (status, button) => {
  const allButton = document.querySelectorAll(".filterButton");
  for (const filterButton of allButton) {
    filterButton.classList.remove("selected");
  }
  button.classList.add("selected");

  const allTasks = document.querySelectorAll("#taskList li");

  for (const taskElement of allTasks) {
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
  }
};

// Ajout des boutons de filtrage
document
  .getElementById("filterAll")
  .addEventListener("click", (event) => filterTasks("all", event.target));
document
  .getElementById("filterCompleted")
  .addEventListener("click", (event) => filterTasks("completed", event.target));
document
  .getElementById("filterIncomplete")
  .addEventListener("click", (event) =>
    filterTasks("incomplete", event.target)
  );

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

// Fonction de tri par date de création (plus récent en premier)
const sortByDate = () => {
  const allTasks = document.querySelectorAll("#taskList li");
  const sortedTasks = [...allTasks].sort((a, b) => {
    const dateA = new Date(a.getAttribute("data-id"));
    const dateB = new Date(b.getAttribute("data-id"));
    return dateB - dateA;
  });
  renderTasks(sortedTasks);
};

// Fonction de tri par ordre alphabétique
const sortByAlpha = () => {
  const allTasks = document.querySelectorAll("#taskList li");
  const sortedTasks = [...allTasks].sort((a, b) => {
    const nameA = a.querySelector("span + span").textContent.toLowerCase();
    const nameB = b.querySelector("span + span").textContent.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  renderTasks(sortedTasks);
};

// Fonction de tri par statut (terminées / en cours)
const sortByStatus = () => {
  const allTasks = document.querySelectorAll("#taskList li");
  const sortedTasks = [...allTasks].sort((a, b) => {
    const statusA = a.querySelector("span").textContent === "✓" ? 1 : 0;
    const statusB = b.querySelector("span").textContent === "✓" ? 1 : 0;
    return statusB - statusA;
  });
  renderTasks(sortedTasks);
};

// Fonction pour réafficher les tâches triées
const renderTasks = (tasks) => {
  taskList.innerHTML = "";
  for (const task of tasks) {
    taskList.appendChild(task);
  }
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
