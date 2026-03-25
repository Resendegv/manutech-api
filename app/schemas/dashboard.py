from pydantic import BaseModel


class DashboardRecentOrder(BaseModel):
    id: int
    titulo: str
    status: str
    prioridade: str

    class Config:
        from_attributes = True


class DashboardResponse(BaseModel):
    total_equipamentos: int
    total_ordens: int
    ordens_abertas: int
    ordens_em_andamento: int
    ordens_finalizadas: int
    total_historicos: int
    ultimas_ordens: list[DashboardRecentOrder]