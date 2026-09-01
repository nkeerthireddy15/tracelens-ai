# tracelens-ai
# TraceLens AI

TraceLens AI is an AI-powered production incident analysis platform for developers.

It analyzes production logs and stack traces, redacts sensitive information, generates structured AI analysis and eventually retrieves similar historical incidents and previous resolutions.

## First milestone

Developer pastes a production error → TraceLens redacts secrets → Gemini analyzes it → the backend validates the response → the UI displays structured analysis.

## Tech stack

- React
- Vite
- Node.js
- Express.js
- MongoDB Atlas
- Gemini API
- JavaScript
- npm workspaces

## Project structure

```text
tracelens-ai/
├── apps/
│   ├── web/       React frontend
│   └── api/       Express backend
├── package.json
├── package-lock.json
└── README.md