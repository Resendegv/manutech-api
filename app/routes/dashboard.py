from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment import Equipment
from app.models.work_order import WorkOrder
from app.models.maintenance_history import MaintenanceHistory
from app.models.user import User
from app.schemas.dashboard import DashboardResponse, DashboardRecentOrder
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_equipamentos = db.query(Equipment).count()
    total_ordens = db.query(WorkOrder).count()
    ordens_abertas = db.query(WorkOrder).filter(WorkOrder.status == "aberta").count()
    ordens_em_andamento = db.query(WorkOrder).filter(
        WorkOrder.status == "em_andamento"
    ).count()
    ordens_finalizadas = db.query(WorkOrder).filter(
        WorkOrder.status == "finalizada"
    ).count()
    total_historicos = db.query(MaintenanceHistory).count()

    ultimas_ordens_db = db.query(WorkOrder).order_by(WorkOrder.id.desc()).limit(5).all()
    ultimas_ordens = [
        DashboardRecentOrder(
            id=ordem.id,
            titulo=ordem.titulo,
            status=ordem.status,
            prioridade=ordem.prioridade
        )
        for ordem in ultimas_ordens_db
    ]

    return {
        "total_equipamentos": total_equipamentos,
        "total_ordens": total_ordens,
        "ordens_abertas": ordens_abertas,
        "ordens_em_andamento": ordens_em_andamento,
        "ordens_finalizadas": ordens_finalizadas,
        "total_historicos": total_historicos,
        "ultimas_ordens": ultimas_ordens,
    }