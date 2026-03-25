from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text, nullable=False)
    status = Column(String, default="aberta")
    prioridade = Column(String, default="media")
    data_abertura = Column(DateTime, default=datetime.utcnow)
    data_fechamento = Column(DateTime, nullable=True)

    equipamento_id = Column(Integer, ForeignKey("equipments.id"), nullable=False)
    tecnico_responsavel_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    equipment = relationship("Equipment", back_populates="work_orders")
    tecnico_responsavel = relationship("User", back_populates="work_orders")
    maintenance_history = relationship("MaintenanceHistory", back_populates="work_order")