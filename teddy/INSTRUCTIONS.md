# TEDDY — Instructions (5 minutes) - Version Gemini Gratuit

## 1. Clé API gratuite (Google Gemini)
→ Va sur aistudio.google.com → "Get API key" → "Create API key"
→ Copie la longue clé générée
→ L'accès est totalement gratuit et très généreux pour faire tourner ton IA !

## 2. GitHub
→ github.com → "New repository" → nom: teddy-ai → Public → Create
→ "uploading an existing file" → uploade tous les fichiers/dossiers de ton projet modifié

## 3. Netlify (gratuit)
→ netlify.com → "Add new site" → Import from GitHub → teddy-ai → Deploy

## 4. Ajouter la clé API
→ Netlify → Site configuration → Environment variables
→ Add variable: GEMINI_API_KEY = ta-longue-clé-google
→ Deploys → "Trigger deploy" (ou "Clear cache and deploy site")

## 5. Ton URL
→ https://teddy-xxx.netlify.app
→ Sur ton Mac ou iPhone: Safari → Partager → "Sur l'écran d'accueil"

## Structure des fichiers
teddy/
├── public/
│   └── index.html        ← Interface visuelle de TEDDY
├── netlify/
│   └── functions/
│       └── chat.js       ← Le moteur (modifié pour l'API Gemini gratuite)
├── netlify.toml          ← Config Netlify
└── package.json          ← Dépendances (mis à jour pour Google)