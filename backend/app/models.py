from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    size_bytes = Column(Integer)
    row_count = Column(Integer)
    column_count = Column(Integer)
    status = Column(String, default="Uploaded")
    
    # Parent-child relationship for dataset lineage
    parent_dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    
    # Relationships
    processing_logs = relationship("ProcessingLog", back_populates="dataset")
    children = relationship("Dataset", backref=relationship("Dataset", remote_side=[id]))

class ProcessingLog(Base):
    __tablename__ = "processing_logs"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    action = Column(String)
    parameters = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="processing_logs")

class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    config = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
