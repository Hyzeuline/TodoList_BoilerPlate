document.getElementById('addTaskBtn').addEventListener('click', () => {
    const taskInput = document.getElementById('taskInput');
    if (taskInput.value.trim()) {
      fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: taskInput.value })
      })
      .then(response => response.json())
      .then(task => {
        taskInput.value = '';
        // À compléter : Ajouter la tâche à l'interface
      });
    }
  });
  
  // À compléter : Charger les tâches au démarrage
  