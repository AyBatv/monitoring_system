from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])


@router.get("/", response_model=List[schemas.MetricRead], summary="Получить список метрик")
def read_metrics(server_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if server_id is not None:
        return crud.get_metrics_by_server(db, server_id=server_id)
    return crud.get_metrics(db, skip=skip, limit=limit)


@router.get("/{metric_id}", response_model=schemas.MetricRead, summary="Получить метрику по ID")
def read_metric(metric_id: int, db: Session = Depends(get_db)):
    metric = crud.get_metric(db, metric_id)
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Метрика с ID {metric_id} не найдена"
        )
    return metric


@router.post("/", response_model=schemas.MetricRead, status_code=status.HTTP_201_CREATED, summary="Создать метрику")
def create_metric(metric_in: schemas.MetricCreate, db: Session = Depends(get_db)):
    server = crud.get_server(db, metric_in.server_id)
    if not server:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Сервер с ID {metric_in.server_id} не существует"
        )
    return crud.create_metric(db, metric_in)


@router.put("/{metric_id}", response_model=schemas.MetricRead, summary="Обновить пороги метрики")
def update_metric(metric_id: int, metric_in: schemas.MetricUpdate, db: Session = Depends(get_db)):
    metric = crud.update_metric(db, metric_id, metric_in)
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Метрика с ID {metric_id} не найдена"
        )
    return metric


@router.delete("/{metric_id}", response_model=schemas.MetricRead, summary="Удалить метрику")
def delete_metric(metric_id: int, db: Session = Depends(get_db)):
    metric = crud.delete_metric(db, metric_id)
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Метрика с ID {metric_id} не найдена"
        )
    return metric
