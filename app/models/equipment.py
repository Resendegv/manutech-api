from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    numero_serie = Column(String, unique=True, index=True, nullable=False)
    fabricante = Column(String, nullable=False)
    setor = Column(String, nullable=False)
    data_cadastro = Column(DateTime, default=datetime.utcnow)

    work_orders = relationship("WorkOrder", back_populates="equipment")
    maintenance_history = relationship("MaintenanceHistory", back_populates="equipment")