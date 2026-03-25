from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, String
from sqlalchemy.orm import relationship

from app.database import Base


class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"

    id = Column(Integer, primary_key=True, index=True)
    descricao_servico = Column(Text, nullable=False)
    data_servico = Column(DateTime, default=datetime.utcnow)
    observacao = Column(Text, nullable=True)
    tipo_manutencao = Column(String, nullable=False, default="corretiva")

    equipamento_id = Column(Integer, ForeignKey("equipments.id"), nullable=False)
    work_order_id = Column(Integer, ForeignKey("work_orders.id"), nullable=True)

    equipment = relationship("Equipment", back_populates="maintenance_history")
    work_order = relationship("WorkOrder", back_populates="maintenance_history")