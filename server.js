const express = require("express");
const app = express();
const port = 3000;

// Base de données simulée
let tasks = [{ id: 1, name: "Exemple de tâche", completed: false }];

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Routes API
app.get("/tasks", (req, res) => res.json(tasks));
app.post("/tasks", (req, res) => {
  const task = { id: Date.now(), ...req.body };
  tasks.push(task);
  res.status(201).json(task);
  if (!req.body.name || !req.body.name.trim()) {
    return res.status(400).json({ error: "Le nom de la tâche est requis." });
  }
});
// Supprimer une tâche par ID
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex((task) => task.id === id);

  if (index !== -1) {
    tasks.splice(index, 1);
    res.sendStatus(204); // No Content
  } else {
    res.status(404).json({ error: "Tâche non trouvée" });
  }
});

// Mettre à jour une tâche (ex: marquer comme terminée)
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Tâche non trouvée" });

  // Si le champ 'completed' est bien défini, on le met à jour
  if (typeof req.body.completed === "boolean") {
    task.completed = req.body.completed;
  }

  // Si le champ 'name' est présent et non vide, on le met à jour
  if (typeof req.body.name === "string" && req.body.name.trim()) {
    task.name = req.body.name.trim();
  }

  res.json(task);
});

// Démarrage du serveur
app.listen(port, () =>
  console.log(`Serveur démarré sur http://localhost:${port}`)
);
