import * as d3 from 'd3'
import { PostService } from '../services/PostService.js'

export class GraphWindow {
  constructor() {
    this.postService = new PostService()
    this.graphData = null
    this.simulation = null
    this.svg = null
    this.isVisible = false
    this.width = 800
    this.height = 500
    this.nodeRadius = 6
    this.linkDistance = 80
  }

  async init() {
    await this.postService.loadPosts()
    this.prepareGraphData()
    this.createWindow()
    this.createGraph()
  }

  prepareGraphData() {
    const posts = this.postService.getAllPosts()
    const categories = this.postService.getCategories()
    const tags = this.postService.getTags()

    // Criar nós
    const nodes = []
    const nodeMap = new Map()

    // Adicionar posts como nós
    posts.forEach(post => {
      const node = {
        id: `post-${post.id}`,
        type: 'post',
        label: post.title,
        data: post,
        size: 5,
        color: '#3B82F6'
      }
      nodes.push(node)
      nodeMap.set(node.id, node)
    })

    // Adicionar categorias como nós
    categories.forEach(category => {
      const node = {
        id: `category-${category.name}`,
        type: 'category',
        label: category.name,
        data: category,
        size: 8,
        color: '#EF4444'
      }
      nodes.push(node)
      nodeMap.set(node.id, node)
    })

    // Adicionar tags como nós
    tags.forEach(tag => {
      const node = {
        id: `tag-${tag.name}`,
        type: 'tag',
        label: tag.name,
        data: tag,
        size: 6,
        color: '#10B981'
      }
      nodes.push(node)
      nodeMap.set(node.id, node)
    })

    // Criar links
    const links = []

    // Links entre posts e categorias
    posts.forEach(post => {
      if (post.categories) {
        post.categories.forEach(category => {
          links.push({
            source: `post-${post.id}`,
            target: `category-${category}`,
            type: 'post-category',
            strength: 0.8
          })
        })
      }
    })

    // Links entre posts e tags
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          links.push({
            source: `post-${post.id}`,
            target: `tag-${tag}`,
            type: 'post-tag',
            strength: 0.6
          })
        })
      }
    })

    this.graphData = { nodes, links, nodeMap }
  }

  createWindow() {
    // Verificar se a janela já existe
    if (document.getElementById('graph-window')) {
      return
    }

    const windowHTML = `
      <div id="graph-window" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Relacionamentos do Blog</h2>
              <button id="close-graph-window" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="flex h-[calc(90vh-120px)]">
              <!-- Graph Container -->
              <div class="flex-1 p-4">
                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg h-full relative overflow-hidden">
                  <div id="mini-graph-container" class="w-full h-full"></div>
                  
                  <!-- Loading Overlay -->
                  <div id="graph-loading" class="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 flex items-center justify-center">
                    <div class="text-center">
                      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p class="text-gray-600 dark:text-gray-400">Carregando relacionamentos...</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sidebar -->
              <div class="w-80 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
                <!-- Legend -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Legenda</h3>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span class="text-sm text-gray-700 dark:text-gray-300">Posts</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span class="text-sm text-gray-700 dark:text-gray-300">Categorias</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span class="text-sm text-gray-700 dark:text-gray-300">Tags</span>
                    </div>
                  </div>
                </div>

                <!-- Node Info -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Informações</h3>
                  <div id="mini-node-info" class="text-sm text-gray-600 dark:text-gray-400">
                    Clique em um nó para ver detalhes
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Estatísticas</h3>
                  <div id="mini-stats" class="space-y-2 text-sm">
                    <!-- Stats will be inserted here -->
                  </div>
                </div>

                <!-- Controls -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Controles</h3>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filtro</label>
                      <select id="mini-type-filter" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="all">Todos</option>
                        <option value="post">Posts</option>
                        <option value="category">Categorias</option>
                        <option value="tag">Tags</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Distância</label>
                      <input type="range" id="mini-link-distance" min="50" max="150" value="${this.linkDistance}" class="w-full">
                    </div>
                    <div class="flex space-x-2">
                      <button id="mini-reset-view" class="flex-1 px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                        Resetar
                      </button>
                      <button id="mini-restart-sim" class="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Reorganizar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                <span id="mini-node-count">0</span> nós • <span id="mini-link-count">0</span> conexões
              </div>
              <div class="flex space-x-2">
                <button id="open-full-graph" class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Abrir Visualização Completa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', windowHTML)

    // Event listeners
    document.getElementById('close-graph-window').addEventListener('click', () => {
      this.hide()
    })

    document.getElementById('open-full-graph').addEventListener('click', () => {
      window.open('graph.html', '_blank')
    })

    // Close on backdrop click
    document.getElementById('graph-window').addEventListener('click', (e) => {
      if (e.target.id === 'graph-window') {
        this.hide()
      }
    })

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide()
      }
    })
  }

  createGraph() {
    const container = document.getElementById('mini-graph-container')
    if (!container) return

    // Limpar container
    container.innerHTML = ''

    // Criar SVG
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('background', 'transparent')

    // Criar grupo para zoom
    const g = this.svg.append('g')

    // Adicionar zoom
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    this.svg.call(zoom)

    // Criar força de simulação
    this.simulation = d3.forceSimulation(this.graphData.nodes)
      .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(this.linkDistance))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 3))

    // Criar links
    const link = g.append('g')
      .selectAll('line')
      .data(this.graphData.links)
      .enter()
      .append('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'post-category': return '#EF4444'
          case 'post-tag': return '#10B981'
          default: return '#6B7280'
        }
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5)

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
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)

    // Adicionar labels aos nós (menores)
    node.append('text')
      .text(d => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 12)
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .style('pointer-events', 'none')

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

    // Setup controls
    this.setupMiniControls()

    // Update stats
    this.updateMiniStats()

    // Hide loading
    setTimeout(() => {
      const loading = document.getElementById('graph-loading')
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
    const infoContainer = document.getElementById('mini-node-info')
    if (infoContainer) {
      let info = `<div class="font-medium text-gray-900 dark:text-white mb-2">${node.label}</div>`
      
      switch (node.type) {
        case 'post':
          info += `
            <div class="space-y-1 text-xs">
              <div><span class="font-medium">Autor:</span> ${node.data.author}</div>
              <div><span class="font-medium">Data:</span> ${node.data.date}</div>
              <div><span class="font-medium">Categorias:</span> ${node.data.categories?.join(', ') || 'Nenhuma'}</div>
              <div><span class="font-medium">Tags:</span> ${node.data.tags?.join(', ') || 'Nenhuma'}</div>
            </div>
          `
          break
        case 'category':
          info += `<div class="text-xs"><span class="font-medium">Posts:</span> ${node.data.count}</div>`
          break
        case 'tag':
          info += `<div class="text-xs"><span class="font-medium">Posts:</span> ${node.data.count}</div>`
          break
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

    this.svg.selectAll('.node').style('opacity', d => 
      connectedNodes.has(d.id) ? 1 : 0.3
    )

    this.svg.selectAll('line').style('opacity', d => 
      connectedLinks.includes(d) ? 1 : 0.1
    )
  }

  resetHighlight() {
    this.svg.selectAll('.node').style('opacity', 1)
    this.svg.selectAll('line').style('opacity', 0.5)
  }

  setupMiniControls() {
    document.getElementById('mini-type-filter').addEventListener('change', (e) => {
      this.filterByType(e.target.value)
    })

    document.getElementById('mini-link-distance').addEventListener('input', (e) => {
      const distance = parseInt(e.target.value)
      this.updateLinkDistance(distance)
    })

    document.getElementById('mini-reset-view').addEventListener('click', () => {
      this.resetView()
    })

    document.getElementById('mini-restart-sim').addEventListener('click', () => {
      this.restartSimulation()
    })
  }

  filterByType(type) {
    if (type === 'all') {
      this.svg.selectAll('.node').style('display', 'block')
      this.svg.selectAll('line').style('display', 'block')
    } else {
      this.svg.selectAll('.node').style('display', d => d.type === type ? 'block' : 'none')
      this.svg.selectAll('line').style('display', d => 
        d.source.type === type || d.target.type === type ? 'block' : 'none'
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

  updateMiniStats() {
    const posts = this.postService.getAllPosts()
    const categories = this.postService.getCategories()
    const tags = this.postService.getTags()
    const links = this.graphData?.links || []

    const statsContainer = document.getElementById('mini-stats')
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Posts:</span>
          <span class="font-medium text-gray-900 dark:text-white">${posts.length}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Categorias:</span>
          <span class="font-medium text-gray-900 dark:text-white">${categories.length}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Tags:</span>
          <span class="font-medium text-gray-900 dark:text-white">${tags.length}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-gray-600 dark:text-gray-400">Conexões:</span>
          <span class="font-medium text-gray-900 dark:text-white">${links.length}</span>
        </div>
      `
    }

    document.getElementById('mini-node-count').textContent = posts.length + categories.length + tags.length
    document.getElementById('mini-link-count').textContent = links.length
  }

  show() {
    const window = document.getElementById('graph-window')
    if (window) {
      window.classList.remove('hidden')
      this.isVisible = true
      
      // Trigger animation
      setTimeout(() => {
        window.querySelector('.bg-white').classList.add('animate-in')
      }, 10)
    }
  }

  hide() {
    const window = document.getElementById('graph-window')
    if (window) {
      window.classList.add('hidden')
      this.isVisible = false
    }
  }

  destroy() {
    if (this.simulation) {
      this.simulation.stop()
    }
    if (this.svg) {
      this.svg.remove()
    }
    const window = document.getElementById('graph-window')
    if (window) {
      window.remove()
    }
  }
} 