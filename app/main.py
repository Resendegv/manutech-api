from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import user, equipment, work_order, maintenance_history
from app.routes.auth import router as auth_router
from app.routes.equipments import router as equipment_router
from app.routes.work_orders import router as work_orders_router
from app.routes.maintenance_history import router as maintenance_history_router
from app.routes.dashboard import router as dashboard_router

# Cria as tabelas no banco
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Manutech - Sistema de Manutenção")

# 🔥 CORS CORRIGIDO (LOCAL + PRODUÇÃO)
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://manutech-api.vercel.app",  # 👈 ESSENCIAL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth_router)
app.include_router(equipment_router)
app.include_router(work_orders_router)
app.include_router(maintenance_history_router)
app.include_router(dashboard_router)

# Rota raiz
@app.get("/")
def read_root():
    return {"message": "API do Manutech funcionando"}