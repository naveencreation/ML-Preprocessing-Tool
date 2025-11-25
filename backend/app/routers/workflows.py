from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter(
    prefix="/workflows",
    tags=["workflows"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.WorkflowTemplate)
def create_workflow_template(template: schemas.WorkflowTemplateCreate, db: Session = Depends(get_db)):
    # Check if name exists
    existing = db.query(models.WorkflowTemplate).filter(models.WorkflowTemplate.name == template.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Template with this name already exists")

    db_template = models.WorkflowTemplate(
        name=template.name,
        description=template.description,
        config=template.config.dict()
    )
    db.add(db_template)
    try:
        db.commit()
        db.refresh(db_template)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_template

@router.get("/", response_model=List[schemas.WorkflowTemplate])
def read_workflow_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    templates = db.query(models.WorkflowTemplate).offset(skip).limit(limit).all()
    return templates

@router.get("/{template_id}", response_model=schemas.WorkflowTemplate)
def read_workflow_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(models.WorkflowTemplate).filter(models.WorkflowTemplate.id == template_id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Workflow template not found")
    return db_template

@router.delete("/{template_id}")
def delete_workflow_template(template_id: int, db: Session = Depends(get_db)):
    db_template = db.query(models.WorkflowTemplate).filter(models.WorkflowTemplate.id == template_id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Workflow template not found")
    db.delete(db_template)
    db.commit()
    return {"ok": True}
