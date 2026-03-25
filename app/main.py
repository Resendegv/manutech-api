from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import user, equipment, work_order, maintenance_history
from app.routes.auth import router as auth_router
from app.routes.equipments import router as equipment_router
from app.routes.work_orders import router as work_orders_router
from app.routes.maintenance_history import router as maintenance_history_router
from app.routes.dashboard import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Manutech - Sistema de Manutenção")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(equipment_router)
app.include_router(work_orders_router)
app.include_router(maintenance_history_router)
app.include_router(dashboard_router)


@app.get("/")
def read_root():
    return {"message": "API do Manutech funcionando"}