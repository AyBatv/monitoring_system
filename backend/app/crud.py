from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from . import models, schemas


def get_servers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Server]:
    return db.query(models.Server).offset(skip).limit(limit).all()


def get_server(db: Session, server_id: int) -> Optional[models.Server]:
    return db.query(models.Server).filter(models.Server.id == server_id).first()


def get_server_by_hostname(db: Session, hostname: str) -> Optional[models.Server]:
    return db.query(models.Server).filter(models.Server.hostname == hostname).first()


def create_server(db: Session, server_in: schemas.ServerCreate) -> models.Server:
    server = models.Server(**server_in.model_dump())
    db.add(server)
    db.commit()
    db.refresh(server)
    return server


def update_server(db: Session, server_id: int, server_in: schemas.ServerUpdate) -> Optional[models.Server]:
    server = get_server(db, server_id)
    if not server:
        return None
    for field, value in server_in.model_dump(exclude_unset=True).items():
        setattr(server, field, value)
    db.commit()
    db.refresh(server)
    return server


def delete_server(db: Session, server_id: int) -> Optional[models.Server]:
    server = get_server(db, server_id)
    if not server:
        return None
    db.delete(server)
    db.commit()
    return server


def get_metrics(db: Session, skip: int = 0, limit: int = 100) -> List[models.Metric]:
    return db.query(models.Metric).offset(skip).limit(limit).all()


def get_metrics_by_server(db: Session, server_id: int) -> List[models.Metric]:
    return db.query(models.Metric).filter(models.Metric.server_id == server_id).all()


def get_metric(db: Session, metric_id: int) -> Optional[models.Metric]:
    return db.query(models.Metric).filter(models.Metric.id == metric_id).first()


def create_metric(db: Session, metric_in: schemas.MetricCreate) -> models.Metric:
    metric = models.Metric(**metric_in.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


def update_metric(db: Session, metric_id: int, metric_in: schemas.MetricUpdate) -> Optional[models.Metric]:
    metric = get_metric(db, metric_id)
    if not metric:
        return None
    for field, value in metric_in.model_dump(exclude_unset=True).items():
        setattr(metric, field, value)
    db.commit()
    db.refresh(metric)
    return metric


def delete_metric(db: Session, metric_id: int) -> Optional[models.Metric]:
    metric = get_metric(db, metric_id)
    if not metric:
        return None
    db.delete(metric)
    db.commit()
    return metric


def get_incidents(db: Session, skip: int = 0, limit: int = 100) -> List[models.Incident]:
    return db.query(models.Incident).offset(skip).limit(limit).all()


def get_incident(db: Session, incident_id: int) -> Optional[models.Incident]:
    return db.query(models.Incident).filter(models.Incident.id == incident_id).first()


def create_incident(db: Session, incident_in: schemas.IncidentCreate) -> models.Incident:
    data = incident_in.model_dump()
    if not data.get("started_at"):
        data["started_at"] = datetime.utcnow()
    incident = models.Incident(**data)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def update_incident(db: Session, incident_id: int, incident_in: schemas.IncidentUpdate) -> Optional[models.Incident]:
    incident = get_incident(db, incident_id)
    if not incident:
        return None
    for field, value in incident_in.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)
    db.commit()
    db.refresh(incident)
    return incident


def delete_incident(db: Session, incident_id: int) -> Optional[models.Incident]:
    incident = get_incident(db, incident_id)
    if not incident:
        return None
    db.delete(incident)
    db.commit()
    return incident


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    user = models.User(**user_in.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, user_in: schemas.UserUpdate) -> Optional[models.User]:
    user = get_user(db, user_id)
    if not user:
        return None
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> Optional[models.User]:
    user = get_user(db, user_id)
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user
