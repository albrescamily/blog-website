import * as d3 from 'd3'
import { PostService } from '../services/PostService.js'

export class GraphSection {
  constructor() {
    this.postService = new PostService()
    this.graphData = null
    this.simulation = null
    this.svg = null
    this.width = 1200
    this.height = 600
    this.nodeRadius = 8
    this.linkDistance = 120
  }

  async init() {
    await this.postService.loadPosts()
    this.prepareGraphData()
  }

  prepareGraphData() {
    const posts = this.postService.getAllPosts()

    // Criar nós apenas para posts
    const nodes = []
    const nodeMap = new Map()

    // Adicionar posts como nós
    posts.forEach(post => {
      const node = {
        id: `post-${post.id}`,
        type: 'post',
        label: post.title,
        data: post,
        size: 12,
        color: '#3B82F6'
      }
      nodes.push(node)
      nodeMap.set(node.id, node)
    })

    // Criar links entre posts baseados em tags e categorias compartilhadas
    const links = []
    const processedPairs = new Set()

    posts.forEach((post1, index1) => {
      posts.forEach((post2, index2) => {
        if (index1 >= index2) return // Evitar duplicatas e auto-conexões

        const pairId = `${Math.min(index1, index2)}-${Math.max(index1, index2)}`
        if (processedPairs.has(pairId)) return

        let connectionStrength = 0
        let connectionType = ''

        // Verificar categorias compartilhadas
        if (post1.categories && post2.categories) {
          const sharedCategories = post1.categories.filter(cat => 
            post2.categories.includes(cat)
          )
          if (sharedCategories.length > 0) {
            connectionStrength += sharedCategories.length * 0.8
            connectionType = 'category'
          }
        }

        // Verificar tags compartilhadas
        if (post1.tags && post2.tags) {
          const sharedTags = post1.tags.filter(tag => 
            post2.tags.includes(tag)
          )
          if (sharedTags.length > 0) {
            connectionStrength += sharedTags.length * 0.6
            connectionType = connectionType ? 'both' : 'tag'
          }
        }

        // Criar link se há conexão
        if (connectionStrength > 0) {
          links.push({
            source: `post-${post1.id}`,
            target: `post-${post2.id}`,
            type: connectionType,
            strength: connectionStrength,
            sharedCategories: post1.categories && post2.categories ? 
              post1.categories.filter(cat => post2.categories.includes(cat)) : [],
            sharedTags: post1.tags && post2.tags ? 
              post1.tags.filter(tag => post2.tags.includes(tag)) : []
          })
          processedPairs.add(pairId)
        }
      })
    })

    this.graphData = { nodes, links, nodeMap }
  }

    render() {
    const section = document.createElement('section')
    section.className = 'py-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'
    
    section.innerHTML = `
      <div class="max-w-7xl mx-auto px-6">
        <!-- Header da seção -->
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Relacionamentos do Blog
          </h2>
        </div>

        <!-- Container principal -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Grafo -->
          <div class="lg:col-span-3">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 h-[700px] relative overflow-hidden">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Grafo de Relacionamentos</h3>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  <span id="section-node-count">0</span> nós • <span id="section-link-count">0</span> conexões
                </div>
              </div>
              <div id="section-graph-container" class="w-full h-[620px] bg-gray-50 dark:bg-gray-900 rounded-lg relative">
                <!-- Loading -->
                <div id="section-graph-loading" class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 flex items-center justify-center">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1 space-y-4">
            <!-- Legenda -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Legenda</h3>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Posts</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Conexão por Categoria</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Conexão por Tag</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Conexão Múltipla</span>
                </div>
              </div>
            </div>

            <!-- Informações -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Informações</h3>
              <div id="section-node-info" class="text-sm text-gray-600 dark:text-gray-400">
                Clique em um nó para ver detalhes
              </div>
            </div>

            <!-- Estatísticas -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Estatísticas</h3>
              <div id="section-stats" class="space-y-1 text-sm">
                <!-- Stats will be inserted here -->
              </div>
            </div>



            <!-- Link para visualização completa -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg">
              <a href="graph.html" target="_blank" class="inline-block w-full px-3 py-2 text-sm bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors text-center font-medium">
                Visualização Completa
              </a>
            </div>
          </div>
        </div>
      </div>
    `

    // Criar o grafo após o DOM estar pronto
    setTimeout(() => {
      this.createGraph()
      this.setupControls()
      this.updateStats()
    }, 100)

    return section
  }

  createGraph() {
    const container = document.getElementById('section-graph-container')
    if (!container) return

    // Limpar container
    container.innerHTML = ''

    // Obter dimensões do container
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width || this.width
    const containerHeight = containerRect.height || this.height

    // Criar SVG responsivo
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .style('background', 'transparent')

    // Criar grupo para zoom
    const g = this.svg.append('g')

    // Adicionar zoom
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    this.svg.call(zoom)

         // Criar força de simulação
     this.simulation = d3.forceSimulation(this.graphData.nodes)
       .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(this.linkDistance))
       .force('charge', d3.forceManyBody().strength(-200))
       .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
       .force('collision', d3.forceCollide().radius(d => d.size + 5))

    // Criar links
    const link = g.append('g')
      .selectAll('line')
      .data(this.graphData.links)
      .enter()
      .append('line')
      .attr('stroke', d => {
        const isDark = document.documentElement.classList.contains('dark')
        switch (d.type) {
          case 'category': 
            return isDark ? '#F87171' : '#DC2626'
          case 'tag': 
            return isDark ? '#34D399' : '#059669'
          case 'both': 
            return isDark ? '#A78BFA' : '#7C3AED'
          default: 
            return isDark ? '#9CA3AF' : '#6B7280'
        }
      })
      .attr('stroke-width', d => Math.max(2, d.strength * 3))
      .attr('stroke-opacity', d => {
        const isDark = document.documentElement.classList.contains('dark')
        return isDark ? 0.8 : 0.7
      })
      .attr('stroke-linecap', 'round')

    // Criar nós
    const node = g.append('g')
      .selectAll('g')
      .data(this.graphData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this)))

    // Adicionar círculos aos nós
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => {
        const isDark = document.documentElement.classList.contains('dark')
        const baseColor = d.color
        return isDark ? baseColor : baseColor
      })
      .attr('stroke', d => {
        const isDark = document.documentElement.classList.contains('dark')
        return isDark ? '#374151' : '#ffffff'
      })
      .attr('stroke-width', 2)
      .attr('filter', d => {
        const isDark = document.documentElement.classList.contains('dark')
        return isDark ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
      })

         // Adicionar labels aos nós (maiores)
     const labels = node.append('text')
       .text(d => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
       .attr('text-anchor', 'middle')
       .attr('dy', d => d.size + 18)
       .attr('font-size', '12px')
       .attr('font-weight', '700')
       .attr('class', 'node-label')
       .style('pointer-events', 'none')

     // Aplicar cores baseadas no tema
     this.updateLabelColors()

    // Adicionar tooltips
    node.append('title')
      .text(d => {
        switch (d.type) {
          case 'post': return `Post: ${d.label}`
          case 'category': return `Categoria: ${d.label} (${d.data.count} posts)`
          case 'tag': return `Tag: ${d.label} (${d.data.count} posts)`
          default: return d.label
        }
      })

    // Atualizar posições na simulação
    this.simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Adicionar interatividade
    node.on('click', (event, d) => {
      this.handleNodeClick(d)
    })

    node.on('mouseover', (event, d) => {
      this.highlightNode(d)
    })

    node.on('mouseout', (event, d) => {
      this.resetHighlight()
    })

    // Hide loading
    setTimeout(() => {
      const loading = document.getElementById('section-graph-loading')
      if (loading) {
        loading.style.display = 'none'
      }
    }, 1000)
  }

  dragstarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }

  dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }

  dragended(event, d) {
    if (!event.active) this.simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  handleNodeClick(node) {
    const infoContainer = document.getElementById('section-node-info')
    if (infoContainer) {
      let info = `<div class="font-medium text-gray-900 dark:text-white mb-2">${node.label}</div>`
      
      // Informações básicas do post
      info += `
        <div class="space-y-1 text-xs">
          <div><span class="font-medium">Autor:</span> ${node.data.author}</div>
          <div><span class="font-medium">Data:</span> ${node.data.date}</div>
          <div><span class="font-medium">Categorias:</span> ${node.data.categories?.join(', ') || 'Nenhuma'}</div>
          <div><span class="font-medium">Tags:</span> ${node.data.tags?.join(', ') || 'Nenhuma'}</div>
        </div>
      `

      // Encontrar conexões deste post
      const connections = this.graphData.links.filter(link => 
        link.source.id === node.id || link.target.id === node.id
      )

      if (connections.length > 0) {
        info += `<div class="mt-2 text-xs"><span class="font-medium">Conexões:</span> ${connections.length}</div>`
        
        // Agrupar conexões por tipo
        const categoryConnections = connections.filter(c => c.type === 'category' || c.type === 'both')
        const tagConnections = connections.filter(c => c.type === 'tag' || c.type === 'both')
        
        if (categoryConnections.length > 0) {
          info += `<div class="text-xs text-red-600">• ${categoryConnections.length} por categoria</div>`
        }
        if (tagConnections.length > 0) {
          info += `<div class="text-xs text-green-600">• ${tagConnections.length} por tag</div>`
        }
      }
      
      infoContainer.innerHTML = info
    }
  }

  highlightNode(selectedNode) {
    const connectedNodes = new Set()
    const connectedLinks = []

    this.graphData.links.forEach(link => {
      if (link.source.id === selectedNode.id || link.target.id === selectedNode.id) {
        connectedNodes.add(link.source.id)
        connectedNodes.add(link.target.id)
        connectedLinks.push(link)
      }
    })

    const isDark = document.documentElement.classList.contains('dark')

    this.svg.selectAll('.node').style('opacity', d => 
      connectedNodes.has(d.id) ? 1 : 0.2
    )

    this.svg.selectAll('line').style('opacity', d => 
      connectedLinks.includes(d) ? 1 : 0.05
    )

    // Destacar o nó selecionado
    this.svg.selectAll('.node circle').filter(d => d.id === selectedNode.id)
      .attr('stroke-width', 3)
      .attr('stroke', isDark ? '#FBBF24' : '#D97706')
  }

  resetHighlight() {
    const isDark = document.documentElement.classList.contains('dark')
    
    this.svg.selectAll('.node').style('opacity', 1)
    this.svg.selectAll('line').style('opacity', d => {
      return isDark ? 0.8 : 0.7
    })
    
    // Resetar destaque do nó selecionado
    this.svg.selectAll('.node circle')
      .attr('stroke-width', 2)
      .attr('stroke', d => isDark ? '#374151' : '#ffffff')
  }

  setupControls() {
    // Controles removidos - mantendo método vazio para compatibilidade
    
    // Listener para mudanças de tema
    this.themeObserver = new MutationObserver(() => {
      this.updateLabelColors()
    })
    
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  }

  updateLabelColors() {
    if (!this.svg) return
    
    const isDark = document.documentElement.classList.contains('dark')
    
    this.svg.selectAll('.node-label')
      .attr('fill', isDark ? '#FFFFFF' : '#000000')
      .style('text-shadow', isDark ? 
        '0 1px 3px rgba(0,0,0,0.8)' : 
        '0 1px 3px rgba(255,255,255,1)'
      )
  }

  filterByType(type) {
    if (type === 'all') {
      this.svg.selectAll('.node').style('display', 'block')
      this.svg.selectAll('line').style('display', 'block')
    } else {
      this.svg.selectAll('.node').style('display', 'block') // Sempre mostrar todos os posts
      this.svg.selectAll('line').style('display', d => 
        d.type === type ? 'block' : 'none'
      )
    }
  }

  updateLinkDistance(distance) {
    this.linkDistance = distance
    this.simulation.force('link').distance(distance)
    this.simulation.alpha(0.3).restart()
  }

  resetView() {
    this.svg.transition().duration(750).call(
      d3.zoom().transform,
      d3.zoomIdentity
    )
  }

  restartSimulation() {
    this.simulation.alpha(1).restart()
  }

  updateStats() {
    const posts = this.postService.getAllPosts()
    const links = this.graphData?.links || []

    // Contar tipos de conexões
    const categoryConnections = links.filter(link => link.type === 'category').length
    const tagConnections = links.filter(link => link.type === 'tag').length
    const bothConnections = links.filter(link => link.type === 'both').length

    const statsContainer = document.getElementById('section-stats')
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Posts:</span>
          <span class="font-medium text-gray-900 dark:text-white">${posts.length}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Conexões:</span>
          <span class="font-medium text-gray-900 dark:text-white">${links.length}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Por Categoria:</span>
          <span class="font-medium text-red-600">${categoryConnections}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Por Tag:</span>
          <span class="font-medium text-green-600">${tagConnections}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Múltiplas:</span>
          <span class="font-medium text-purple-600">${bothConnections}</span>
        </div>
      `
    }

    document.getElementById('section-node-count').textContent = posts.length
    document.getElementById('section-link-count').textContent = links.length
  }

  destroy() {
    if (this.simulation) {
      this.simulation.stop()
    }
    if (this.svg) {
      this.svg.remove()
    }
    
    // Limpar observer se existir
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }
  }
} 