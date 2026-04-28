# Lumiu PWA: Entity-Relationship and Dataflow Diagrams

This document contains the structural and behavioral diagrams for the entire Lumiu PWA project, focused on its AI-powered adaptability features, chat, and learning ecosystem. You can convert this file into a PDF using standard Markdown-to-PDF tools or extensions.

## 1. Entity-Relationship (ER) Diagram

This diagram maps out the core logical entities within the system. Since the PWA is primarily client-centric and relies on real-time LLM interactions, this represents the internal object model and data structures passed around.

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

## 2. Dataflow Diagram (DFD)

This diagram outlines how data moves from the user through the Next.js API Routes out to Google Gemini AI, and back as actionable insights or dynamic application states.

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

---
*Note: This architecture highlights the real-time AI capabilities (powered by Gemini) and the localized datasets handling the adaptability engine inside the PWA.*
