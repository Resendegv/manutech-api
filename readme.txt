# Manutech

Sistema de gestão de manutenção para controle de equipamentos, ordens de serviço e histórico técnico, com dashboard operacional e autenticação de usuários.

## Sobre o projeto

O **Manutech** é uma aplicação web desenvolvida para organizar a rotina de manutenção de equipamentos e ativos operacionais.

O sistema permite cadastrar equipamentos, abrir ordens de serviço, atualizar status, registrar históricos de manutenção e acompanhar indicadores por meio de um dashboard.

Foi pensado para cenários reais de operação, especialmente em ambientes como:
- manutenção industrial
- terraplanagem
- mineração
- construção pesada
- frota de equipamentos

## Funcionalidades

- Login com autenticação JWT
- Dashboard com indicadores operacionais
- Cadastro de equipamentos
- Busca de equipamentos por nome, modelo, série, fabricante e setor
- Criação e gerenciamento de ordens de serviço
- Atualização de status das ordens
- Filtros por status e prioridade
- Registro de histórico de manutenção
- Tipos de manutenção:
  - preventiva
  - corretiva
- Geração automática de histórico ao finalizar uma ordem
- Interface web integrada ao backend

## Dashboard

O dashboard apresenta:
- total de equipamentos
- total de ordens
- ordens abertas
- ordens em andamento
- ordens finalizadas
- total de históricos
- ordens recentes

## Tecnologias utilizadas

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn
- JWT

### Frontend
- HTML5
- CSS3
- JavaScript

## Estrutura do projeto

```bash
PROJETO_2/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── __init__.py
│
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── equipments.html
│   ├── work_orders.html
│   ├── history.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── equipments.js
│       ├── work_orders.js
│       └── history.js
│
├── screenshots/
├── requirements.txt
├── README.md
└── .gitignore