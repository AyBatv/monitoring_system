from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


@router.get("/", response_model=List[schemas.IncidentRead], summary="Получить список всех инцидентов")
def read_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_incidents(db, skip=skip, limit=limit)


@router.get("/{incident_id}", response_model=schemas.IncidentRead, summary="Получить инцидент по ID")
def read_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = crud.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Инцидент с ID {incident_id} не найден"
        )
    return incident


@router.post("/", response_model=schemas.IncidentRead, status_code=status.HTTP_201_CREATED, summary="Зарегистрировать новый инцидент")
def create_incident(incident_in: schemas.IncidentCreate, db: Session = Depends(get_db)):
    server = crud.get_server(db, incident_in.server_id)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сервер с ID {incident_in.server_id} не существует"
        )
    if incident_in.user_id:
        user = crud.get_user(db, incident_in.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Пользователь с ID {incident_in.user_id} не найден"
            )
    return crud.create_incident(db, incident_in)


@router.put("/{incident_id}", response_model=schemas.IncidentRead, summary="Обновить статус или назначить исполнителя")
def update_incident(incident_id: int, incident_in: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    if incident_in.user_id:
        user = crud.get_user(db, incident_in.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Пользователь с ID {incident_in.user_id} не найден"
            )
    incident = crud.update_incident(db, incident_id, incident_in)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Инцидент с ID {incident_id} не найден"
        )
    return incident


@router.delete("/{incident_id}", response_model=schemas.IncidentRead, summary="Удалить инцидент")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = crud.delete_incident(db, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Инцидент с ID {incident_id} не найден"
        )
    return incident
