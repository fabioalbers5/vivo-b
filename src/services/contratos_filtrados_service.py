"""
Serviço para registro de contratos filtrados.

Este módulo implementa a lógica de negócio para registrar contratos
que já foram processados em um determinado mês, evitando duplicações
nas análises posteriores.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.postgresql import insert
from src.models.contratos_filtrados import ContratoFiltrado
from src.database.config import get_db_session
import logging

logger = logging.getLogger(__name__)

class ContratosFilteredService:
    """Serviço para gerenciar contratos filtrados."""
    
    @staticmethod
    def registrar_contratos_filtrados(contratos: List[Dict[str, Any]], 
                                    usuario: str = 'fabio') -> Dict[str, Any]:
        """
        Registra contratos filtrados na tabela contratos_filtrados.
        
        Esta função implementa lógica idempotente usando PostgreSQL UPSERT
        (ON CONFLICT DO NOTHING) para evitar duplicações de contratos no mesmo mês.
        
        Args:
            contratos (List[Dict]): Lista de contratos filtrados. 
                                  Cada contrato deve ter ao menos 'numero_contrato'
            usuario (str, optional): Nome do usuário que executou a filtragem. 
                                   Defaults to 'fabio'.
        
        Returns:
            Dict[str, Any]: Resultado da operação contendo:
                - sucesso (bool): Se a operação foi bem-sucedida
                - total_contratos (int): Total de contratos processados
                - novos_registros (int): Quantos novos registros foram inseridos
                - duplicados_ignorados (int): Quantos duplicados foram ignorados
                - mes_referencia (str): Mês de referência usado
                - data_analise (str): Data da análise no formato DD-MM-YYYY
                - erro (str, optional): Mensagem de erro se houver falha
        
        Example:
            >>> contratos = [
            ...     {'numero_contrato': 12345, 'fornecedor': 'Empresa A'},
            ...     {'numero_contrato': 67890, 'fornecedor': 'Empresa B'}
            ... ]
            >>> resultado = ContratosFilteredService.registrar_contratos_filtrados(
            ...     contratos, 'fabio'
            ... )
            >>> print(resultado)
            {
                'sucesso': True,
                'total_contratos': 2,
                'novos_registros': 2,
                'duplicados_ignorados': 0,
                'mes_referencia': '10-2025',
                'data_analise': '01-10-2025'
            }
        """
        if not contratos:
            return {
                'sucesso': False,
                'total_contratos': 0,
                'novos_registros': 0,
                'duplicados_ignorados': 0,
                'erro': 'Lista de contratos está vazia'
            }
        
        # Gerar mês de referência automaticamente (formato MM-YYYY)
        mes_referencia = ContratoFiltrado.gerar_mes_referencia()
        data_analise = datetime.now()
        data_analise_str = ContratoFiltrado.formatar_data_analise(data_analise)
        
        total_contratos = len(contratos)
        novos_registros = 0
        duplicados_ignorados = 0
        
        try:
            with get_db_session() as session:
                logger.info(f"🔄 Iniciando registro de {total_contratos} contratos para o mês {mes_referencia}")
                
                # Preparar dados para inserção
                registros = []
                for contrato in contratos:
                    # Extrair numero_contrato (pode estar em diferentes campos)
                    numero_contrato = None
                    
                    # Tentar diferentes possíveis nomes de campos
                    for campo in ['numero_contrato', 'numeroContrato', 'number', 'id']:
                        if campo in contrato and contrato[campo]:
                            numero_contrato = int(contrato[campo])
                            break
                    
                    if not numero_contrato:
                        logger.warning(f"⚠️ Contrato sem numero_contrato válido: {contrato}")
                        continue
                    
                    registros.append({
                        'numero_contrato': numero_contrato,
                        'mes_referencia': mes_referencia,
                        'data_analise': data_analise,
                        'usuario': usuario
                    })
                
                if not registros:
                    return {
                        'sucesso': False,
                        'total_contratos': total_contratos,
                        'novos_registros': 0,
                        'duplicados_ignorados': 0,
                        'erro': 'Nenhum contrato válido encontrado'
                    }
                
                # Usar PostgreSQL UPSERT para inserção idempotente
                stmt = insert(ContratoFiltrado).values(registros)
                
                # ON CONFLICT DO NOTHING para evitar duplicatas
                stmt = stmt.on_conflict_do_nothing(
                    index_elements=['numero_contrato', 'mes_referencia']
                )
                
                # Executar inserção e obter número de linhas afetadas
                result = session.execute(stmt)
                novos_registros = result.rowcount
                duplicados_ignorados = len(registros) - novos_registros
                
                # Commit da transação
                session.commit()
                
                logger.info(f"✅ Registro concluído: {novos_registros} novos, {duplicados_ignorados} duplicados ignorados")
                
                return {
                    'sucesso': True,
                    'total_contratos': total_contratos,
                    'novos_registros': novos_registros,
                    'duplicados_ignorados': duplicados_ignorados,
                    'mes_referencia': mes_referencia,
                    'data_analise': data_analise_str,
                    'usuario': usuario
                }
                
        except Exception as e:
            logger.error(f"❌ Erro ao registrar contratos filtrados: {e}")
            return {
                'sucesso': False,
                'total_contratos': total_contratos,
                'novos_registros': 0,
                'duplicados_ignorados': 0,
                'mes_referencia': mes_referencia,
                'data_analise': data_analise_str,
                'erro': str(e)
            }
    
    @staticmethod
    def verificar_contratos_ja_filtrados(contratos: List[Dict[str, Any]], 
                                       mes_referencia: Optional[str] = None) -> List[int]:
        """
        Verifica quais contratos já foram filtrados no mês especificado.
        
        Args:
            contratos (List[Dict]): Lista de contratos para verificar
            mes_referencia (str, optional): Mês no formato MM-YYYY. 
                                          Se None, usa mês atual.
        
        Returns:
            List[int]: Lista de números de contrato que já foram filtrados
        """
        if not contratos:
            return []
        
        if mes_referencia is None:
            mes_referencia = ContratoFiltrado.gerar_mes_referencia()
        
        try:
            with get_db_session() as session:
                # Extrair números de contrato
                numeros_contrato = []
                for contrato in contratos:
                    for campo in ['numero_contrato', 'numeroContrato', 'number', 'id']:
                        if campo in contrato and contrato[campo]:
                            numeros_contrato.append(int(contrato[campo]))
                            break
                
                if not numeros_contrato:
                    return []
                
                # Consultar contratos já filtrados
                contratos_existentes = session.query(ContratoFiltrado.numero_contrato)\
                    .filter(
                        ContratoFiltrado.numero_contrato.in_(numeros_contrato),
                        ContratoFiltrado.mes_referencia == mes_referencia
                    ).all()
                
                return [c[0] for c in contratos_existentes]
                
        except Exception as e:
            logger.error(f"❌ Erro ao verificar contratos filtrados: {e}")
            return []
    
    @staticmethod
    def filtrar_contratos_nao_processados(contratos: List[Dict[str, Any]], 
                                        mes_referencia: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Filtra lista de contratos removendo aqueles já processados no mês.
        
        Args:
            contratos (List[Dict]): Lista de contratos para filtrar
            mes_referencia (str, optional): Mês no formato MM-YYYY. 
                                          Se None, usa mês atual.
        
        Returns:
            List[Dict]: Lista de contratos que ainda não foram processados
        """
        contratos_ja_filtrados = ContratosFilteredService.verificar_contratos_ja_filtrados(
            contratos, mes_referencia
        )
        
        if not contratos_ja_filtrados:
            return contratos
        
        contratos_nao_processados = []
        for contrato in contratos:
            numero_contrato = None
            for campo in ['numero_contrato', 'numeroContrato', 'number', 'id']:
                if campo in contrato and contrato[campo]:
                    numero_contrato = int(contrato[campo])
                    break
            
            if numero_contrato not in contratos_ja_filtrados:
                contratos_nao_processados.append(contrato)
        
        logger.info(f"📊 Filtrados {len(contratos_nao_processados)} contratos não processados de {len(contratos)} total")
        return contratos_nao_processados

# Função de conveniência para compatibilidade
def registrar_contratos_filtrados(contratos: List[Dict[str, Any]], 
                                usuario: str = 'fabio') -> Dict[str, Any]:
    """
    Função de conveniência para registrar contratos filtrados.
    
    Esta é uma interface simplificada para o método da classe de serviço.
    """
    return ContratosFilteredService.registrar_contratos_filtrados(contratos, usuario)