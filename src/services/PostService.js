/**
 * PostService
 * Responsável por gerenciar dados dos posts
 */

export class PostService {
  constructor() {
    this.posts = []
    this.postsMeta = []
    this.categories = []
    this.tags = []
    this.categoryCounts = {}
    this.tagCounts = {}
  }

  /**
   * Carrega todos os posts
   */
  async loadPosts() {
    try {
      // Carrega metadados
      const metaRes = await fetch('posts/posts.json')
      this.postsMeta = await metaRes.json()

      // Carrega conteúdo markdown
      this.posts = await Promise.all(this.postsMeta.map(async meta => {
        try {
          const res = await fetch(meta.filename)
          const content = res.ok ? await res.text() : ''
          return { ...meta, content }
        } catch {
          return { ...meta, content: '' }
        }
      }))

      // Extrai categorias e tags únicas
      this.extractCategoriesAndTags()
      
      // Calcula contadores
      this.calculateCounts()
      
      return this.posts
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      return []
    }
  }

  /**
   * Extrai categorias e tags únicas dos posts
   */
  extractCategoriesAndTags() {
    this.categories = [...new Set(this.posts.flatMap(p => p.categories || []))]
    this.tags = [...new Set(this.posts.flatMap(p => p.tags || []))]
  }

  /**
   * Calcula contadores de categorias e tags
   */
  calculateCounts() {
    // Conta categorias
    this.categoryCounts = {}
    this.categories.forEach(category => {
      this.categoryCounts[category] = this.posts.filter(post => 
        post.categories && post.categories.includes(category)
      ).length
    })

    // Conta tags
    this.tagCounts = {}
    this.tags.forEach(tag => {
      this.tagCounts[tag] = this.posts.filter(post => 
        post.tags && post.tags.includes(tag)
      ).length
    })
  }

  /**
   * Retorna todos os posts
   */
  getAllPosts() {
    return this.posts
  }

  /**
   * Retorna posts filtrados por categoria
   */
  getPostsByCategory(category) {
    return this.posts.filter(post => 
      post.categories && post.categories.includes(category)
    )
  }

  /**
   * Retorna posts filtrados por múltiplas categorias
   */
  getPostsByCategories(categories) {
    if (!categories || categories.length === 0) return this.posts
    
    return this.posts.filter(post => 
      post.categories && categories.some(cat => post.categories.includes(cat))
    )
  }

  /**
   * Retorna posts filtrados por tag
   */
  getPostsByTag(tag) {
    return this.posts.filter(post => 
      post.tags && post.tags.includes(tag)
    )
  }

  /**
   * Retorna posts filtrados por múltiplas tags
   */
  getPostsByTags(tags) {
    if (!tags || tags.length === 0) return this.posts
    
    return this.posts.filter(post => 
      post.tags && tags.some(tag => post.tags.includes(tag))
    )
  }

  /**
   * Retorna um post específico por ID
   */
  getPostById(id) {
    return this.posts.find(post => post.id === id)
  }

  /**
   * Retorna posts filtrados com base em categorias, tags e termo de busca
   */
  getFilteredPosts(categories = [], tags = [], searchTerm = '') {
    let filtered = this.posts

    // Filtra por categorias
    if (categories && categories.length > 0) {
      filtered = filtered.filter(post => 
        post.categories && categories.some(cat => post.categories.includes(cat))
      )
    }

    // Filtra por tags
    if (tags && tags.length > 0) {
      filtered = filtered.filter(post => 
        post.tags && tags.some(tag => post.tags.includes(tag))
      )
    }

    // Filtra por termo de busca
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        (post.categories && post.categories.some(cat => 
          cat.toLowerCase().includes(term)
        )) ||
        (post.tags && post.tags.some(tag => 
          tag.toLowerCase().includes(term)
        )) ||
        (post.author && post.author.toLowerCase().includes(term))
      )
    }

    return filtered
  }

  /**
   * Retorna todas as categorias com contadores
   */
  getCategories() {
    return this.categories.map(category => ({
      name: category,
      count: this.categoryCounts[category] || 0
    }))
  }

  /**
   * Retorna todas as tags com contadores
   */
  getTags() {
    return this.tags.map(tag => ({
      name: tag,
      count: this.tagCounts[tag] || 0
    }))
  }

  /**
   * Retorna tags disponíveis para categorias específicas
   */
  getTagsForCategories(categories) {
    if (!categories || categories.length === 0) {
      return this.getTags()
    }
    
    const postsInCategories = this.getPostsByCategories(categories)
    const tagsInCategories = [...new Set(postsInCategories.flatMap(p => p.tags || []))]
    
    return tagsInCategories.map(tag => ({
      name: tag,
      count: postsInCategories.filter(post => 
        post.tags && post.tags.includes(tag)
      ).length
    }))
  }

  /**
   * Retorna contador de uma categoria específica
   */
  getCategoryCount(category) {
    return this.categoryCounts[category] || 0
  }

  /**
   * Retorna contador de uma tag específica
   */
  getTagCount(tag) {
    return this.tagCounts[tag] || 0
  }

  /**
   * Retorna posts mais recentes
   */
  getRecentPosts(limit = 3) {
    return this.posts.slice(0, limit)
  }

  /**
   * Busca posts por termo
   */
  searchPosts(term) {
    const searchTerm = term.toLowerCase()
    return this.posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      (post.categories && post.categories.some(cat => 
        cat.toLowerCase().includes(searchTerm)
      )) ||
      (post.tags && post.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      ))
    )
  }
} 