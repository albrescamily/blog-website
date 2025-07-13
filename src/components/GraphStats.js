import { PostService } from '../services/PostService.js'

export class GraphStats {
  constructor() {
    this.postService = new PostService()
  }

  async init() {
    await this.postService.loadPosts()
    this.renderStats()
  }

  renderStats() {
    const container = document.getElementById('graph-stats')
    if (!container) return

    const posts = this.postService.getAllPosts()
    const categories = this.postService.getCategories()
    const tags = this.postService.getTags()

    // Calcular estatísticas
    const stats = this.calculateStats(posts, categories, tags)

    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Estatísticas Detalhadas</h3>
        
        <!-- Resumo Geral -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-blue-600">${stats.totalPosts}</div>
            <div class="text-sm text-blue-700">Posts</div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-red-600">${stats.totalCategories}</div>
            <div class="text-sm text-red-700">Categorias</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">${stats.totalTags}</div>
            <div class="text-sm text-green-700">Tags</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg text-center">
            <div class="text-2xl font-bold text-purple-600">${stats.totalConnections}</div>
            <div class="text-sm text-purple-700">Conexões</div>
          </div>
        </div>

        <!-- Categorias Mais Populares -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-3">Categorias Mais Populares</h4>
          <div class="space-y-2">
            ${stats.topCategories.map(cat => `
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="text-sm text-gray-700">${cat.name}</span>
                <span class="text-sm font-semibold text-gray-900">${cat.count} posts</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tags Mais Populares -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-3">Tags Mais Populares</h4>
          <div class="space-y-2">
            ${stats.topTags.map(tag => `
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="text-sm text-gray-700">${tag.name}</span>
                <span class="text-sm font-semibold text-gray-900">${tag.count} posts</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Posts com Mais Conexões -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-3">Posts com Mais Conexões</h4>
          <div class="space-y-2">
            ${stats.postsWithMostConnections.map(post => `
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="text-sm text-gray-700">${post.title}</span>
                <span class="text-sm font-semibold text-gray-900">${post.connections} conexões</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Análise de Densidade -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-3">Análise de Densidade</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-yellow-50 p-3 rounded">
              <div class="text-sm font-semibold text-yellow-800">Densidade do Grafo</div>
              <div class="text-lg font-bold text-yellow-600">${stats.graphDensity.toFixed(3)}</div>
              <div class="text-xs text-yellow-700">Conexões / Nós possíveis</div>
            </div>
            <div class="bg-indigo-50 p-3 rounded">
              <div class="text-sm font-semibold text-indigo-800">Média de Tags/Post</div>
              <div class="text-lg font-bold text-indigo-600">${stats.avgTagsPerPost.toFixed(1)}</div>
              <div class="text-xs text-indigo-700">Tags por post</div>
            </div>
            <div class="bg-pink-50 p-3 rounded">
              <div class="text-sm font-semibold text-pink-800">Média de Categorias/Post</div>
              <div class="text-lg font-bold text-pink-600">${stats.avgCategoriesPerPost.toFixed(1)}</div>
              <div class="text-xs text-pink-700">Categorias por post</div>
            </div>
          </div>
        </div>

        <!-- Distribuição Temporal -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-3">Distribuição Temporal</h4>
          <div class="space-y-2">
            ${stats.temporalDistribution.map(item => `
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="text-sm text-gray-700">${item.period}</span>
                <span class="text-sm font-semibold text-gray-900">${item.count} posts</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }

  calculateStats(posts, categories, tags) {
    // Contadores básicos
    const totalPosts = posts.length
    const totalCategories = categories.length
    const totalTags = tags.length

    // Calcular conexões
    let totalConnections = 0
    posts.forEach(post => {
      if (post.categories) totalConnections += post.categories.length
      if (post.tags) totalConnections += post.tags.length
    })

    // Top categorias
    const topCategories = categories
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top tags
    const topTags = tags
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Posts com mais conexões
    const postsWithMostConnections = posts.map(post => {
      const categoryConnections = post.categories ? post.categories.length : 0
      const tagConnections = post.tags ? post.tags.length : 0
      return {
        title: post.title,
        connections: categoryConnections + tagConnections
      }
    }).sort((a, b) => b.connections - a.connections).slice(0, 5)

    // Densidade do grafo
    const totalNodes = totalPosts + totalCategories + totalTags
    const maxPossibleConnections = totalNodes * (totalNodes - 1) / 2
    const graphDensity = totalConnections / maxPossibleConnections

    // Médias
    const totalTagConnections = posts.reduce((sum, post) => 
      sum + (post.tags ? post.tags.length : 0), 0)
    const avgTagsPerPost = totalTagConnections / totalPosts

    const totalCategoryConnections = posts.reduce((sum, post) => 
      sum + (post.categories ? post.categories.length : 0), 0)
    const avgCategoriesPerPost = totalCategoryConnections / totalPosts

    // Distribuição temporal
    const temporalDistribution = this.calculateTemporalDistribution(posts)

    return {
      totalPosts,
      totalCategories,
      totalTags,
      totalConnections,
      topCategories,
      topTags,
      postsWithMostConnections,
      graphDensity,
      avgTagsPerPost,
      avgCategoriesPerPost,
      temporalDistribution
    }
  }

  calculateTemporalDistribution(posts) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const distribution = [
      { period: 'Este mês', count: 0 },
      { period: 'Últimos 3 meses', count: 0 },
      { period: 'Últimos 6 meses', count: 0 },
      { period: 'Este ano', count: 0 },
      { period: 'Anos anteriores', count: 0 }
    ]

    posts.forEach(post => {
      const postDate = new Date(post.date)
      const postYear = postDate.getFullYear()
      const postMonth = postDate.getMonth()
      const monthsDiff = (currentYear - postYear) * 12 + (currentMonth - postMonth)

      if (monthsDiff === 0) {
        distribution[0].count++
      } else if (monthsDiff <= 3) {
        distribution[1].count++
      } else if (monthsDiff <= 6) {
        distribution[2].count++
      } else if (postYear === currentYear) {
        distribution[3].count++
      } else {
        distribution[4].count++
      }
    })

    return distribution
  }
} 