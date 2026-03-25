from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.equipment import Equipment
from app.models.user import User
from app.schemas.equipment import EquipmentCreate, EquipmentResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/equipments", tags=["Equipamentos"])


@router.post("/", response_model=EquipmentResponse)
def create_equipment(
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipamento_existente = db.query(Equipment).filter(
        Equipment.numero_serie == equipment.numero_serie
    ).first()

    if equipamento_existente:
        raise HTTPException(status_code=400, detail="Número de série já cadastrado")

    novo = Equipment(**equipment.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.get("/", response_model=List[EquipmentResponse])
def list_equipments(
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Equipment)

    if search:
        termo = f"%{search}%"
        query = query.filter(
            or_(
                Equipment.nome.ilike(termo),
                Equipment.modelo.ilike(termo),
                Equipment.fabricante.ilike(termo),
                Equipment.setor.ilike(termo),
                Equipment.numero_serie.ilike(termo),
            )
        )

    return query.order_by(Equipment.id.asc()).all()


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")

    return equipment


@router.delete("/{equipment_id}")
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")

    if equipment.work_orders:
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir equipamento com ordens de serviço vinculadas"
        )

    if equipment.maintenance_history:
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir equipamento com histórico vinculado"
        )

    db.delete(equipment)
    db.commit()

    return {"message": "Equipamento deletado com sucesso"}