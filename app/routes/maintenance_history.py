from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance_history import MaintenanceHistory
from app.models.equipment import Equipment
from app.models.work_order import WorkOrder
from app.schemas.maintenance_history import (
    MaintenanceHistoryCreate,
    MaintenanceHistoryResponse,
)

router = APIRouter(prefix="/maintenance-history", tags=["Maintenance History"])


@router.post("/", response_model=MaintenanceHistoryResponse)
def create_maintenance_history(
    history: MaintenanceHistoryCreate,
    db: Session = Depends(get_db),
):
    equipamento = db.query(Equipment).filter(Equipment.id == history.equipamento_id).first()
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    if history.ordem_id is not None:
        ordem = db.query(WorkOrder).filter(WorkOrder.id == history.ordem_id).first()
        if not ordem:
            raise HTTPException(status_code=404, detail="Ordem de serviço não encontrada.")

    novo_historico = MaintenanceHistory(
        descricao_servico=history.descricao_servico,
        observacao=history.observacao,
        tipo_manutencao=history.tipo_manutencao,
        data_servico=datetime.utcnow(),
        equipamento_id=history.equipamento_id,
        work_order_id=history.ordem_id,
    )

    db.add(novo_historico)
    db.commit()
    db.refresh(novo_historico)

    return MaintenanceHistoryResponse(
        id=novo_historico.id,
        descricao_servico=novo_historico.descricao_servico,
        data_servico=novo_historico.data_servico,
        observacao=novo_historico.observacao,
        tipo_manutencao=novo_historico.tipo_manutencao,
        equipamento_id=novo_historico.equipamento_id,
        ordem_id=novo_historico.work_order_id,
    )


@router.get("/", response_model=list[MaintenanceHistoryResponse])
def list_maintenance_history(
    equipamento_id: Optional[int] = Query(default=None),
    tipo_manutencao: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(MaintenanceHistory)

    if equipamento_id is not None:
        query = query.filter(MaintenanceHistory.equipamento_id == equipamento_id)

    if tipo_manutencao:
        query = query.filter(MaintenanceHistory.tipo_manutencao == tipo_manutencao)

    historicos = query.order_by(MaintenanceHistory.data_servico.desc()).all()

    return [
        MaintenanceHistoryResponse(
            id=h.id,
            descricao_servico=h.descricao_servico,
            data_servico=h.data_servico,
            observacao=h.observacao,
            tipo_manutencao=h.tipo_manutencao,
            equipamento_id=h.equipamento_id,
            ordem_id=h.work_order_id,
        )
        for h in historicos
    ]


@router.get("/{history_id}", response_model=MaintenanceHistoryResponse)
def get_maintenance_history(
    history_id: int,
    db: Session = Depends(get_db),
):
    historico = db.query(MaintenanceHistory).filter(MaintenanceHistory.id == history_id).first()

    if not historico:
        raise HTTPException(status_code=404, detail="Histórico não encontrado.")

    return MaintenanceHistoryResponse(
        id=historico.id,
        descricao_servico=historico.descricao_servico,
        data_servico=historico.data_servico,
        observacao=historico.observacao,
        tipo_manutencao=historico.tipo_manutencao,
        equipamento_id=historico.equipamento_id,
        ordem_id=historico.work_order_id,
    )


@router.delete("/{history_id}")
def delete_maintenance_history(
    history_id: int,
    db: Session = Depends(get_db),
):
    historico = db.query(MaintenanceHistory).filter(MaintenanceHistory.id == history_id).first()

    if not historico:
        raise HTTPException(status_code=404, detail="Histórico não encontrado.")

    db.delete(historico)
    db.commit()

    return {"message": "Histórico removido com sucesso."}