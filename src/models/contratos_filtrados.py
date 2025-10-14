"""
Modelos SQLAlchemy para persistência de contratos filtrados.

Este módulo define as entidades de banco de dados necessárias para
registrar contratos que já foram filtrados em um determinado mês,
evitando duplicações nas análises mensais.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class ContratoFiltrado(Base):
    """
    Modelo para rastrear contratos que já foram filtrados em um mês específico.
    
    Esta tabela garante que contratos não sejam analisados múltiplas vezes
    no mesmo mês, implementando idempotência na filtragem.
    """
    __tablename__ = 'contratos_filtrados'
    
    # Chave primária auto-incremento
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Referência ao contrato principal (FK para contratos_vivo.numero_contrato)
    numero_contrato = Column(Integer, nullable=False)
    
    # Mês de referência no formato 'MM-YYYY' (ex: '10-2025')
    mes_referencia = Column(String(7), nullable=False)
    
    # Data/hora da filtragem (timestamp da análise)
    data_analise = Column(DateTime, default=func.now(), nullable=False)
    
    # Usuário que executou a filtragem (opcional)
    usuario = Column(String(100), nullable=True)
    
    # Constraint para evitar duplicações por contrato e mês
    __table_args__ = (
        UniqueConstraint('numero_contrato', 'mes_referencia', 
                        name='uix_contrato_mes'),
    )
    
    def __repr__(self):
        return (f"<ContratoFiltrado(id={self.id}, "
                f"numero_contrato={self.numero_contrato}, "
                f"mes_referencia='{self.mes_referencia}', "
                f"data_analise={self.data_analise}, "
                f"usuario='{self.usuario}')>")
    
    @classmethod
    def gerar_mes_referencia(cls, data=None):
        """
        Gera string de mês referência no formato MM-YYYY.
        
        Args:
            data (datetime, optional): Data de referência. Se None, usa data atual.
            
        Returns:
            str: Mês no formato 'MM-YYYY' (ex: '10-2025')
        """
        if data is None:
            data = datetime.now()
        return data.strftime('%m-%Y')
    
    @classmethod
    def formatar_data_analise(cls, data=None):
        """
        Formata data de análise no formato DD-MM-YYYY.
        
        Args:
            data (datetime, optional): Data de análise. Se None, usa data atual.
            
        Returns:
            str: Data no formato 'DD-MM-YYYY' (ex: '01-10-2025')
        """
        if data is None:
            data = datetime.now()
        return data.strftime('%d-%m-%Y')