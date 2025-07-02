/**
 * Heading Extractor Utility
 * Responsável por extrair e gerenciar headings do conteúdo markdown
 */

export class HeadingExtractor {
  /**
   * Extrai headings do conteúdo markdown
   * @param {string} content - Conteúdo markdown
   * @returns {Array} Array de objetos com level, text e id
   */
  static extractHeadings(content) {
    const headings = []
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      // Remove espaços em branco no início e fim
      const trimmedLine = line.trim()
      
      // Regex melhorada para capturar headings
      const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = this.generateHeadingId(text)
        
        headings.push({
          level,
          text,
          id
        })
      }
    })
    
    return headings
  }

  /**
   * Gera um ID único para o heading
   * @param {string} text - Texto do heading
   * @returns {string} ID único
   */
  static generateHeadingId(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-+|-+$/g, '') // Remove hífens no início e fim
      .trim()
  }

  /**
   * Valida se um heading é válido
   * @param {Object} heading - Objeto do heading
   * @returns {boolean} True se válido
   */
  static isValidHeading(heading) {
    return heading && 
           typeof heading.level === 'number' && 
           heading.level >= 1 && 
           heading.level <= 6 &&
           typeof heading.text === 'string' && 
           heading.text.length > 0 &&
           typeof heading.id === 'string' && 
           heading.id.length > 0
  }

  /**
   * Filtra headings por nível
   * @param {Array} headings - Array de headings
   * @param {number} minLevel - Nível mínimo (inclusive)
   * @param {number} maxLevel - Nível máximo (inclusive)
   * @returns {Array} Headings filtrados
   */
  static filterByLevel(headings, minLevel = 1, maxLevel = 6) {
    return headings.filter(heading => 
      heading.level >= minLevel && heading.level <= maxLevel
    )
  }

  /**
   * Agrupa headings por nível
   * @param {Array} headings - Array de headings
   * @returns {Object} Objeto com headings agrupados por nível
   */
  static groupByLevel(headings) {
    const grouped = {}
    
    headings.forEach(heading => {
      if (!grouped[heading.level]) {
        grouped[heading.level] = []
      }
      grouped[heading.level].push(heading)
    })
    
    return grouped
  }

  /**
   * Cria uma estrutura hierárquica dos headings
   * @param {Array} headings - Array de headings
   * @returns {Array} Estrutura hierárquica
   */
  static createHierarchy(headings) {
    const hierarchy = []
    const stack = []
    
    headings.forEach(heading => {
      // Remove headings do stack que são de nível igual ou menor
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }
      
      // Adiciona o heading atual ao stack
      stack.push(heading)
      
      // Encontra o parent correto
      if (stack.length === 1) {
        hierarchy.push(heading)
      } else {
        const parent = stack[stack.length - 2]
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(heading)
      }
    })
    
    return hierarchy
  }

  /**
   * Calcula a profundidade máxima da hierarquia
   * @param {Array} headings - Array de headings
   * @returns {number} Profundidade máxima
   */
  static getMaxDepth(headings) {
    if (headings.length === 0) return 0
    
    return Math.max(...headings.map(heading => heading.level))
  }

  /**
   * Calcula a profundidade mínima da hierarquia
   * @param {Array} headings - Array de headings
   * @returns {number} Profundidade mínima
   */
  static getMinDepth(headings) {
    if (headings.length === 0) return 0
    
    return Math.min(...headings.map(heading => heading.level))
  }

  /**
   * Normaliza a hierarquia (ajusta níveis para começar do 1)
   * @param {Array} headings - Array de headings
   * @returns {Array} Headings com níveis normalizados
   */
  static normalizeHierarchy(headings) {
    if (headings.length === 0) return headings
    
    const minLevel = this.getMinDepth(headings)
    if (minLevel === 1) return headings
    
    return headings.map(heading => ({
      ...heading,
      level: heading.level - minLevel + 1
    }))
  }

  /**
   * Valida se a hierarquia está correta (sem saltos de nível)
   * @param {Array} headings - Array de headings
   * @returns {boolean} True se a hierarquia está correta
   */
  static validateHierarchy(headings) {
    if (headings.length === 0) return true
    
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = headings[i].level
      const previousLevel = headings[i - 1].level
      
      // Não pode pular mais de um nível
      if (currentLevel > previousLevel + 1) {
        return false
      }
    }
    
    return true
  }

  /**
   * Gera estatísticas dos headings
   * @param {Array} headings - Array de headings
   * @returns {Object} Estatísticas
   */
  static getStatistics(headings) {
    const stats = {
      total: headings.length,
      byLevel: {},
      maxDepth: this.getMaxDepth(headings),
      minDepth: this.getMinDepth(headings),
      isValid: this.validateHierarchy(headings)
    }
    
    // Conta por nível
    headings.forEach(heading => {
      if (!stats.byLevel[heading.level]) {
        stats.byLevel[heading.level] = 0
      }
      stats.byLevel[heading.level]++
    })
    
    return stats
  }
} 