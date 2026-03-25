from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MaintenanceHistoryCreate(BaseModel):
    descricao_servico: str
    observacao: Optional[str] = None
    tipo_manutencao: str
    equipamento_id: int
    ordem_id: Optional[int] = None


class MaintenanceHistoryResponse(BaseModel):
    id: int
    descricao_servico: str
    data_servico: datetime
    observacao: Optional[str]
    tipo_manutencao: str
    equipamento_id: int
    ordem_id: Optional[int]

    class Config:
        from_attributes = True