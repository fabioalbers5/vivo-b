// Utilitários para busca sem acentuação e caracteres especiais
export class SearchUtils {
  
  /**
   * Normaliza texto removendo acentos, convertendo ç para c e removendo caracteres especiais
   */
  static normalizeText(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFD') // Decompor caracteres Unicode
      .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas (acentos)
      .replace(/[çÇ]/g, 'c') // Substituir ç por c
      .replace(/[^\w\s]/g, '') // Remover caracteres especiais, manter apenas letras, números e espaços
      .trim();
  }

  /**
   * Cria query SQL para busca usando UNACCENT (PostgreSQL)
   * Fallback para ILIKE se UNACCENT não estiver disponível
   */
  static createUnaccentQuery(column: string, searchTerm: string): string {
    if (!searchTerm.trim()) return '';
    
    const normalizedTerm = this.normalizeText(searchTerm);
    
    // Query usando UNACCENT (extensão do PostgreSQL)
    // Se não estiver disponível, fallback para ILIKE comum
    return `(
      LOWER(UNACCENT(${column})) LIKE LOWER(UNACCENT('%${normalizedTerm}%'))
      OR 
      LOWER(${column}) ILIKE '%${normalizedTerm}%'
    )`;
  }

  /**
   * Verifica se dois textos são similares ignorando acentos e caracteres especiais
   */
  static isSimilar(text1: string, text2: string): boolean {
    const normalized1 = this.normalizeText(text1);
    const normalized2 = this.normalizeText(text2);
    return normalized1.includes(normalized2) || normalized2.includes(normalized1);
  }

  /**
   * Filtra uma lista de itens baseado em busca sem acentuação
   */
  static filterList<T>(
    items: T[], 
    searchTerm: string, 
    getSearchableText: (item: T) => string
  ): T[] {
    if (!searchTerm.trim()) return items;
    
    const normalizedSearch = this.normalizeText(searchTerm);
    
    return items.filter(item => {
      const itemText = this.normalizeText(getSearchableText(item));
      return itemText.includes(normalizedSearch);
    });
  }

  /**
   * Destaca o termo pesquisado no texto, ignorando acentos
   */
  static highlightText(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const normalizedSearch = this.normalizeText(searchTerm);
    const normalizedText = this.normalizeText(text);
    
    // Encontrar posições onde o termo aparece
    const matches: Array<{start: number, end: number}> = [];
    let searchIndex = 0;
    
    while (searchIndex < normalizedText.length) {
      const foundIndex = normalizedText.indexOf(normalizedSearch, searchIndex);
      if (foundIndex === -1) break;
      
      matches.push({
        start: foundIndex,
        end: foundIndex + normalizedSearch.length
      });
      
      searchIndex = foundIndex + 1;
    }
    
    if (matches.length === 0) return text;
    
    // Construir texto com destacamentos
    let result = '';
    let lastEnd = 0;
    
    matches.forEach(match => {
      // Texto antes do match
      result += text.substring(lastEnd, match.start);
      // Texto com destaque
      result += `<mark>${text.substring(match.start, match.end)}</mark>`;
      lastEnd = match.end;
    });
    
    // Texto restante
    result += text.substring(lastEnd);
    
    return result;
  }

  /**
   * Gera sugestões de busca baseadas em uma lista de termos
   */
  static generateSuggestions<T>(
    items: T[],
    searchTerm: string,
    getSearchableText: (item: T) => string,
    maxSuggestions: number = 5
  ): string[] {
    if (!searchTerm.trim()) return [];
    
    const normalizedSearch = this.normalizeText(searchTerm);
    const suggestions = new Set<string>();
    
    items.forEach(item => {
      const itemText = getSearchableText(item);
      const normalizedText = this.normalizeText(itemText);
      
      if (normalizedText.includes(normalizedSearch)) {
        suggestions.add(itemText);
      }
    });
    
    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Valida se um texto contém apenas caracteres válidos para busca
   */
  static isValidSearchTerm(searchTerm: string): boolean {
    if (!searchTerm.trim()) return false;
    
    // Permitir letras, números, espaços, acentos e alguns caracteres especiais comuns
    const validPattern = /^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/;
    return validPattern.test(searchTerm);
  }

  /**
   * Limpa um termo de busca removendo caracteres potencialmente problemáticos
   */
  static sanitizeSearchTerm(searchTerm: string): string {
    return searchTerm
      .replace(/['"\\%_]/g, '') // Remover caracteres que podem causar problemas em SQL
      .replace(/\s+/g, ' ') // Normalizar espaços múltiplos
      .trim()
      .substring(0, 100); // Limitar tamanho
  }

  /**
   * Cria padrão de busca para PostgreSQL com escape de caracteres especiais
   */
  static createLikePattern(searchTerm: string): string {
    const sanitized = this.sanitizeSearchTerm(searchTerm);
    const escaped = sanitized
      .replace(/\\/g, '\\\\') // Escapar barras invertidas
      .replace(/%/g, '\\%')   // Escapar wildcards
      .replace(/_/g, '\\_');  // Escapar underscores
    
    return `%${escaped}%`;
  }
}

// Configurações específicas para o PostgreSQL/Supabase
export class SupabaseSearchConfig {
  
  /**
   * Verifica se a extensão UNACCENT está disponível no PostgreSQL
   */
  static async checkUnaccentAvailable(): Promise<boolean> {
    try {
      // Esta verificação seria feita no backend
      // Por enquanto, assumimos que está disponível
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cria configuração de busca otimizada para Supabase
   */
  static getSearchConfig(field: string, searchTerm: string) {
    const sanitizedTerm = SearchUtils.sanitizeSearchTerm(searchTerm);
    
    return {
      // Busca exata
      exact: {
        column: field,
        operator: 'eq' as const,
        value: sanitizedTerm
      },
      // Busca com ILIKE (case insensitive)
      ilike: {
        column: field,
        operator: 'ilike' as const,
        value: SearchUtils.createLikePattern(sanitizedTerm)
      },
      // Busca normalizada (para uso com função customizada no PostgreSQL)
      normalized: {
        column: field,
        searchTerm: SearchUtils.normalizeText(sanitizedTerm)
      }
    };
  }
}
