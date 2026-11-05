from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/api/servers", tags=["Servers"])


@router.get("/", response_model=List[schemas.ServerRead], summary="Получить список всех серверов")
def read_servers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_servers(db, skip=skip, limit=limit)


@router.get("/{server_id}", response_model=schemas.ServerRead, summary="Получить сервер по ID")
def read_server(server_id: int, db: Session = Depends(get_db)):
    server = crud.get_server(db, server_id)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сервер с ID {server_id} не найден"
        )
    return server


@router.post("/", response_model=schemas.ServerRead, status_code=status.HTTP_201_CREATED, summary="Добавить новый сервер")
def create_server(server_in: schemas.ServerCreate, db: Session = Depends(get_db)):
    existing = crud.get_server_by_hostname(db, server_in.hostname)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Сервер с именем '{server_in.hostname}' уже существует"
        )
    return crud.create_server(db, server_in)


@router.put("/{server_id}", response_model=schemas.ServerRead, summary="Обновить данные сервера")
def update_server(server_id: int, server_in: schemas.ServerUpdate, db: Session = Depends(get_db)):
    server = crud.update_server(db, server_id, server_in)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сервер с ID {server_id} не найден"
        )
    return server


@router.delete("/{server_id}", response_model=schemas.ServerRead, summary="Удалить сервер")
def delete_server(server_id: int, db: Session = Depends(get_db)):
    server = crud.delete_server(db, server_id)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сервер с ID {server_id} не найден"
        )
    return server
