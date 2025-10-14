"""
Configuração de conexão com banco de dados PostgreSQL.

Este módulo gerencia a conexão SQLAlchemy com PostgreSQL, incluindo
configurações de conexão, pool de conexões e sessões de banco.
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
from typing import Generator
from src.models.contratos_filtrados import Base
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Configuração centralizada do banco de dados."""
    
    def __init__(self):
        # Configurações de conexão (use variáveis de ambiente em produção)
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME', 'vivo_contracts')
        self.username = os.getenv('DB_USER', 'postgres')
        self.password = os.getenv('DB_PASSWORD', '')
        
        # String de conexão PostgreSQL
        self.database_url = (
            f"postgresql://{self.username}:{self.password}@"
            f"{self.host}:{self.port}/{self.database}"
        )
        
        # Configurações do engine
        self.engine_config = {
            'poolclass': QueuePool,
            'pool_size': 5,
            'max_overflow': 10,
            'pool_pre_ping': True,
            'pool_recycle': 3600,
            'echo': os.getenv('DB_ECHO', 'false').lower() == 'true'
        }

# Instância global de configuração
db_config = DatabaseConfig()

# Engine SQLAlchemy
engine = create_engine(db_config.database_url, **db_config.engine_config)

# Factory para sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Metadados para operações de schema
metadata = MetaData()

def create_tables():
    """
    Cria todas as tabelas definidas nos modelos.
    
    Esta função deve ser chamada uma vez durante a inicialização
    da aplicação para garantir que todas as tabelas existam.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tabelas criadas/verificadas com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {e}")
        raise

def drop_tables():
    """
    Remove todas as tabelas (usar apenas em desenvolvimento/testes).
    
    ⚠️ CUIDADO: Esta função remove todas as tabelas definidas nos modelos.
    Use apenas em ambientes de desenvolvimento ou teste.
    """
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("🗑️ Tabelas removidas com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao remover tabelas: {e}")
        raise

@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager para sessões de banco de dados.
    
    Garante que a sessão seja fechada adequadamente e
    que transações sejam commitadas ou revertidas conforme necessário.
    
    Yields:
        Session: Sessão SQLAlchemy configurada
        
    Example:
        with get_db_session() as session:
            # Usar session aqui
            contratos = session.query(ContratoFiltrado).all()
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"❌ Erro na transação de banco: {e}")
        raise
    finally:
        session.close()

def test_connection():
    """
    Testa a conexão com o banco de dados.
    
    Returns:
        bool: True se a conexão for bem-sucedida, False caso contrário
    """
    try:
        with get_db_session() as session:
            session.execute("SELECT 1")
        logger.info("✅ Conexão com banco de dados testada com sucesso")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao conectar com banco de dados: {e}")
        return False

# Função para inicialização da aplicação
def initialize_database():
    """
    Inicializa o banco de dados da aplicação.
    
    Esta função deve ser chamada no início da aplicação para:
    1. Testar a conexão
    2. Criar tabelas necessárias
    3. Validar configuração
    """
    logger.info("🔄 Inicializando banco de dados...")
    
    if not test_connection():
        raise ConnectionError("Não foi possível conectar ao banco de dados")
    
    create_tables()
    logger.info("✅ Banco de dados inicializado com sucesso")