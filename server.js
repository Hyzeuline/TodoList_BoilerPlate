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
});

// Démarrage du serveur
app.listen(port, () =>
  console.log(`Serveur démarré sur http://localhost:${port}`)
);
