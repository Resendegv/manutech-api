from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment import Equipment
from app.models.maintenance_history import MaintenanceHistory
from app.models.work_order import WorkOrder
from app.schemas.work_order import (
    WorkOrderCreate,
    WorkOrderResponse,
    WorkOrderUpdateStatus,
)

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])


@router.post("/", response_model=WorkOrderResponse)
def create_work_order(
    work_order: WorkOrderCreate,
    db: Session = Depends(get_db),
):
    equipamento = db.query(Equipment).filter(Equipment.id == work_order.equipamento_id).first()
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    nova_ordem = WorkOrder(
        titulo=work_order.titulo,
        descricao=work_order.descricao,
        prioridade=work_order.prioridade,
        status="aberta",
        data_abertura=datetime.utcnow(),
        data_fechamento=None,
        equipamento_id=work_order.equipamento_id,
        tecnico_responsavel_id=1,
    )

    db.add(nova_ordem)
    db.commit()
    db.refresh(nova_ordem)

    return nova_ordem


@router.get("/", response_model=list[WorkOrderResponse])
def list_work_orders(
    status: Optional[str] = Query(default=None),
    prioridade: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(WorkOrder)

    if status:
        query = query.filter(WorkOrder.status == status)

    if prioridade:
        query = query.filter(WorkOrder.prioridade == prioridade)

    ordens = query.order_by(WorkOrder.data_abertura.desc()).all()
    return ordens


@router.get("/{work_order_id}", response_model=WorkOrderResponse)
def get_work_order(
    work_order_id: int,
    db: Session = Depends(get_db),
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()

    if not work_order:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada.")

    return work_order


@router.patch("/{work_order_id}/status", response_model=WorkOrderResponse)
def update_work_order_status(
    work_order_id: int,
    payload: WorkOrderUpdateStatus,
    db: Session = Depends(get_db),
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()

    if not work_order:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada.")

    novo_status = payload.status.strip().lower()
    status_validos = {"aberta", "em_andamento", "finalizada"}

    if novo_status not in status_validos:
        raise HTTPException(status_code=400, detail="Status inválido.")

    work_order.status = novo_status

    if novo_status == "finalizada":
        work_order.data_fechamento = datetime.utcnow()

        historico = (
            db.query(MaintenanceHistory)
            .filter(MaintenanceHistory.work_order_id == work_order.id)
            .order_by(MaintenanceHistory.data_servico.desc())
            .first()
        )

        if historico and not historico.observacao:
            historico.observacao = "Ordem de serviço finalizada."
    else:
        work_order.data_fechamento = None

    db.commit()
    db.refresh(work_order)

    return work_order


@router.delete("/{work_order_id}")
def delete_work_order(
    work_order_id: int,
    db: Session = Depends(get_db),
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()

    if not work_order:
        raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada.")

    db.delete(work_order)
    db.commit()

    return {"message": "Ordem de serviço removida com sucesso."}