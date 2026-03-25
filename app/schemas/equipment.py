from pydantic import BaseModel


class EquipmentCreate(BaseModel):
    nome: str
    modelo: str
    numero_serie: str
    fabricante: str
    setor: str


class EquipmentResponse(EquipmentCreate):
    id: int

    class Config:
        from_attributes = True