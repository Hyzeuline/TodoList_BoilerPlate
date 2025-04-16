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
        // À compléter : Ajouter la tâche à l'interface
      });
  }
});

// À compléter : Charger les tâches au démarrage
const taskList = document.querySelector("#taskList");
const fetchTasks = async () => {
  const response = await fetch("/tasks");
  const tasks = await response.json();
  taskList.innerHTML = "";
  for (const task of tasks) {
    //Create <li>
    const li = document.createElement("li");
    li.innerHTML = task.name;
    taskList.appendChild(li);
    //Add delete btn to task
    const deleteBtn = document.createElement("button");
    deleteBtn.addEventListener("click", async () => {
      //const response = await fetch("/tasks", { method: "DELETE" });
      console.log("TODO : delete");
    });
  }
};

fetchTasks();
