# To-Do List Boilerplate  
**Base pour un test technique de développement web**  

## 🚀 Installation  
1. Cloner le dépôt :  
`git clone https://github.com/Meta-sense/TodoList_BoilerPlate.git`

2. Se placer dans le dossier :  
`cd TodoList_BoilerPlate`

3. Installer les dépendances :  
`npm install`

4. Démarrer le serveur :  
`npm start`

5. Ouvrir `public/index.html` dans un navigateur.  

## 🛠️ Structure du projet  
public/<br>
├── index.html # Interface utilisateur<br>
├── styles.css # Styles CSS<br>
└── script.js # Logique front-end<br>
server.js # API Node.js/Express<br>
package.json # Dépendances<br>

## 🔗 API Endpoints  
| Méthode | URL          | Action                 |  
|---------|--------------|------------------------|  
| GET     | `/tasks`     | Lister les tâches      |  
| POST    | `/tasks`     | Ajouter une tâche      |  
| PUT     | `/tasks/:id` | Modifier une tâche     |  
| DELETE  | `/tasks/:id` | Supprimer une tâche    |  

## 💡 Objectifs du test
- **Améliorations front-end** :  
  - Ajouter des interactions utilisateur fluides 
  - Rendre le design responsive/moderniser le CSS
- **Nouvelles fonctionnalités** :  
  - Filtrage des tâches (terminées/en cours)  
  - Validation des champs de saisie  
  - Ajouter des animations CSS  

*Documentez vos choix techniques dans un fichier NOTES.md*  
