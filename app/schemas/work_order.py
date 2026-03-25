from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WorkOrderCreate(BaseModel):
    titulo: str
    descricao: str
    prioridade: str
    equipamento_id: int


class WorkOrderUpdateStatus(BaseModel):
    status: str


class WorkOrderResponse(BaseModel):
    id: int
    titulo: str
    descricao: str
    status: str
    prioridade: str
    data_abertura: datetime
    data_fechamento: Optional[datetime]
    equipamento_id: int
    tecnico_responsavel_id: int

    class Config:
        from_attributes = True