import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import servers, metrics, incidents, users

app = FastAPI(
    title="Server Monitoring System API",
    description="REST API для информационной системы мониторинга состояния серверов",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(servers.router)
app.include_router(metrics.router)
app.include_router(incidents.router)
app.include_router(users.router)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    @app.get("/", tags=["Root"])
    def read_root():
        return {
            "project": "Информационная система мониторинга состояния серверов",
            "status": "online",
            "docs": "/docs"
        }
