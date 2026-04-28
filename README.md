# Lumiu (PWA-app)

A specialized learning tool designed for neurodiverse individuals (ADHD and Dyslexia).

## 📊 Dataset Integration
Integrated the [ADHD Dataset](https://www.kaggle.com/datasets/a7md19/adhd-dataset-4-classes-u2) from Kaggle for behavioral insights.
- **Location**: `public/dataset/adhd_data.csv`
- **Visualization**: Accessible via `/dashboard/insights`
- **API**: Serves processed JSON via `/api/dataset`

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🏗️ Architecture & Data Flow

### 1. Entity-Relationship (ER) Diagram
This diagram maps out the core logical entities within the system and their relationships.

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email
        string adhd_profile
        string settings
    }
    QUIZ {
        string id PK
        string title
        string subject
        int score
        string feedback
    }
    CHAT_SESSION {
        string id PK
        string topic
        datetime started_at
    }
    MESSAGE {
        string id PK
        string role "user or ai"
        string content
        datetime timestamp
    }
    LEARNING_DATASET {
        string id PK
        string traits
        string optimal_strategy
        string context
    }

    USER ||--o{ QUIZ : "takes and tracks"
    USER ||--o{ CHAT_SESSION : "initiates"
    CHAT_SESSION ||--o{ MESSAGE : "contains"
    USER }o--|| LEARNING_DATASET : "trains on & benefits from"
```

### 2. Dataflow Diagram (DFD)
This diagram outlines how data moves from the user through the Next.js API Routes out to the AI models, and back as actionable insights or dynamic application states.

```mermaid
graph TD
    User([Student/User])
    
    subgraph "Client"
        UI[Lumiu Web App]
    end
    
    subgraph "Server"
        API[Next.js API Routes]
    end
    
    subgraph "Services & Data"
        Gemini[Google Gemini AI]
        Data[(Strategy Dataset)]
    end

    User -->|Interacts| UI
    UI -->|Sends Requests| API
    API -->|Fetches Context| Data
    API -->|Prompts| Gemini
    Gemini -->|Returns AI Responses| API
    API -->|Updates State| UI
    UI -->|Displays Info| User

    classDef client fill:#f9f9ff,stroke:#333,stroke-width:1px;
    classDef api fill:#ffd9b3,stroke:#333,stroke-width:1px;
    classDef ext fill:#d9f2d9,stroke:#333,stroke-width:1px;

    class UI client;
    class API api;
    class Gemini,Data ext;
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
