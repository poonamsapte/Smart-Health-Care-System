---
description: Run the Smart Health Care System (Backend + Frontend)
---

This workflow details how to start the full stack application.

1.  **Start Backend Server**
    Open a terminal in `d:\SmartHealthCare` and run:
    ```powershell
    venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000
    ```

2.  **Start Frontend Server**
    Open a *new* terminal in `d:\SmartHealthCare\frontend` and run:
    ```powershell
    npm run dev
    ```

3.  **Access Application**
    - Frontend: [http://localhost:5173](http://localhost:5173) (or the port shown in terminal, e.g., 5174)
    - Backend Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
