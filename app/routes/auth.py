from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import (
    gerar_hash_senha,
    verificar_senha,
    criar_token_acesso
)

router = APIRouter(prefix="/auth", tags=["Auth"])


# 🔹 REGISTER
@router.post("/register", response_model=UserResponse)
def registrar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    
    # verifica se email já existe
    usuario_existente = db.query(User).filter(User.email == user.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    novo_usuario = User(
        nome=user.nome,
        email=user.email,
        senha=gerar_hash_senha(user.senha)
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario


# 🔹 LOGIN (Swagger compatível)
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verificar_senha(form_data.password, user.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos"
        )

    access_token = criar_token_acesso({"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }