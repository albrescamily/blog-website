import * as d3 from 'd3'
import { PostService } from '../services/PostService.js'

export class GraphSection {
  constructor() {
    this.postService = new PostService()
    this.graphData = null
    this.simulation = null
    this.svg = null
    this.width = 700
    this.height = 500
    this.nodeRadius = 7
    this.linkDistance = 90
    this.currentZoom = 1
    this.zoomTransform = d3.zoomIdentity
    this.zoomBehavior = null // Referência para o comportamento de zoom
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
    section.className = 'w-full'
    
    section.innerHTML = `
      <div class="w-full">
        <!-- Container compacto -->
        <div class="w-full">
          <!-- Grafo Compacto -->
          <div class="w-full">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 h-[550px] relative overflow-hidden">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Grafo de Relacionamentos</h3>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  <span id="section-node-count">0</span> nós • <span id="section-link-count">0</span> conexões
                </div>
              </div>
              <div id="section-graph-container" class="w-full h-[480px] bg-gray-50 dark:bg-gray-900 rounded-lg relative"></div>
            </div>
            <!-- Bloco discreto abaixo do grafo -->
            <div class="mt-2 p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded border border-gray-200/30 dark:border-gray-700/30">
              <div class="flex flex-col items-center gap-2">
                <!-- Legenda Centralizada -->
                <div class="flex flex-wrap items-center justify-center gap-3 text-xs">
                  <div class="flex items-center gap-1">
                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span class="text-gray-500 dark:text-gray-400">Posts</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span class="text-gray-500 dark:text-gray-400">Categoria</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span class="text-gray-500 dark:text-gray-400">Tag</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    <span class="text-gray-500 dark:text-gray-400">Múltipla</span>
                  </div>
                </div>
                
                <!-- Estatísticas Centralizadas -->
                <div class="flex items-center justify-center gap-3 text-xs" id="section-stats">
                  <!-- Stats will be inserted here -->
                </div>
              </div>
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
      this.updateZoomIndicator() // Garantir que o indicador seja atualizado inicialmente
      
      // Debug: verificar se os controles foram criados
      console.log('Controles criados:', {
        zoomIn: !!document.getElementById('section-zoom-in'),
        zoomOut: !!document.getElementById('section-zoom-out'),
        reset: !!document.getElementById('section-reset-view'),
        fit: !!document.getElementById('section-fit-view')
      })
    }, 100)

    return section
  }

  createGraph() {
    const container = document.getElementById('section-graph-container')
    if (!container) return

    // Limpar container
    container.innerHTML = ''

    // Criar SVG responsivo
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background', 'transparent')
      .style('position', 'relative')
      .style('z-index', '10')

    // INSERIR CONTROLES DE NAVEGAÇÃO VIA JS
    const controlsHTML = `
      <div id="section-graph-controls" class="absolute top-2 right-2 z-40 space-y-1 pointer-events-none">
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50 pointer-events-auto">
          <div class="flex items-center space-x-1">
            <svg class="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span id="section-zoom-level" class="text-xs font-medium text-gray-900 dark:text-white">100%</span>
          </div>
        </div>
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md p-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50 pointer-events-auto">
          <div class="flex flex-col space-y-0.5">
            <button id="section-zoom-in" class="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-xs transition-colors" title="Zoom In"><span>+</span></button>
            <button id="section-zoom-out" class="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-xs transition-colors" title="Zoom Out"><span>-</span></button>
            <button id="section-reset-view" class="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-xs transition-colors" title="Reset View">⟳</button>
            <button id="section-fit-view" class="p-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded text-xs transition-colors" title="Fit to View">⤢</button>
          </div>
        </div>
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md px-2 py-1 shadow-lg border border-gray-200/50 dark:border-gray-700/50 pointer-events-auto">
          <div class="text-xs text-gray-600 dark:text-gray-400">
            <div>X: <span id="section-mouse-x">0</span></div>
            <div>Y: <span id="section-mouse-y">0</span></div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-2 left-2 z-40 pointer-events-none" id="section-graph-instructions">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm border border-gray-200/40 dark:border-gray-700/40 pointer-events-auto">
          <div class="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
            <div class="flex items-center space-x-1"><span>Arraste para mover</span></div>
            <div class="flex items-center space-x-1"><span>Scroll para zoom</span></div>
            <div class="flex items-center space-x-1"><span>Clique para detalhes</span></div>
          </div>
        </div>
      </div>
      <!-- Card de Informações Flutuante -->
      <div id="section-node-info-card" class="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50 max-w-64 z-50 opacity-0 transition-all duration-300 ease-out pointer-events-none transform scale-95">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-gray-900 dark:text-white text-sm">Informações do Post</h4>
          <button id="section-close-info" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div id="section-node-info-content" class="text-sm text-gray-600 dark:text-gray-400">
          Clique em um nó para ver detalhes
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', controlsHTML);

    // Criar grupo para zoom
    const g = this.svg.append('g')

    // Adicionar zoom
    this.zoomBehavior = d3.zoom()
      .scaleExtent([0.2, 2])
      .on('zoom', (event) => {
        this.zoomTransform = event.transform
        this.currentZoom = event.transform.k
        g.attr('transform', event.transform)
        this.updateZoomIndicator()
      })
    this.svg.call(this.zoomBehavior)

         // Criar força de simulação
     this.simulation = d3.forceSimulation(this.graphData.nodes)
       .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(this.linkDistance))
       .force('charge', d3.forceManyBody().strength(-200))
       .force('center', d3.forceCenter(this.width / 2, this.height / 2))
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
    const infoCard = document.getElementById('section-node-info-card')
    const infoContent = document.getElementById('section-node-info-content')
    
    if (infoCard && infoContent) {
      let info = `
        <div class="mb-3">
          <h5 class="text-base font-bold text-gray-900 dark:text-white mb-2">${node.label}</h5>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>${node.data.date}</span>
          </div>
        </div>
      `
      
      // Categorias
      if (node.data.categories && node.data.categories.length > 0) {
        info += `
          <div class="mb-3">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Categorias</div>
            <div class="flex flex-wrap gap-1.5">
              ${node.data.categories.map(cat => `
                <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-md font-medium">
                  ${cat}
                </span>
              `).join('')}
            </div>
          </div>
        `
      }
      
      // Tags
      if (node.data.tags && node.data.tags.length > 0) {
        info += `
          <div class="mb-3">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tags</div>
            <div class="flex flex-wrap gap-1.5">
              ${node.data.tags.map(tag => `
                <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md font-medium">
                  ${tag}
                </span>
              `).join('')}
            </div>
          </div>
        `
      }

      // Encontrar conexões deste post
      const connections = this.graphData.links.filter(link => 
        link.source.id === node.id || link.target.id === node.id
      )

      if (connections.length > 0) {
        info += `
          <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">${connections.length} conexões</span>
            </div>
        `
        
        // Agrupar conexões por tipo
        const categoryConnections = connections.filter(c => c.type === 'category' || c.type === 'both')
        const tagConnections = connections.filter(c => c.type === 'tag' || c.type === 'both')
        
        if (categoryConnections.length > 0) {
          info += `
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 bg-red-500 rounded-full"></div>
              <span class="text-xs text-gray-600 dark:text-gray-300">${categoryConnections.length} por categoria</span>
            </div>
          `
        }
        if (tagConnections.length > 0) {
          info += `
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-xs text-gray-600 dark:text-gray-300">${tagConnections.length} por tag</span>
            </div>
          `
        }
        info += `</div>`
      }
      
      infoContent.innerHTML = info
      
      // Mostrar o card com animação
      infoCard.style.opacity = '1'
      infoCard.style.pointerEvents = 'auto'
      infoCard.style.transform = 'scale(1)'
      
      // Adicionar classe para animação
      infoCard.classList.remove('scale-95')
      infoCard.classList.add('scale-100')
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
    // Listener para mudanças de tema
    this.themeObserver = new MutationObserver(() => {
      this.updateLabelColors()
    })
    
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Botão para fechar o card de informações
    const closeButton = document.getElementById('section-close-info')
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation()
        this.hideInfoCard()
      })
    }

    // Fechar card ao clicar fora dele
    const graphContainer = document.getElementById('section-graph-container')
    if (graphContainer) {
      graphContainer.addEventListener('click', (e) => {
        const infoCard = document.getElementById('section-node-info-card')
        if (infoCard && !infoCard.contains(e.target) && e.target.closest('.node') === null) {
          this.hideInfoCard()
        }
      })

      // Rastrear posição do mouse
      graphContainer.addEventListener('mousemove', (e) => {
        this.updateMousePosition(e)
      })
    }

    // Controles de zoom
    this.setupZoomControls()
  }

  setupZoomControls() {
    // Aguardar um pouco para garantir que os elementos existam
    setTimeout(() => {
      // Zoom In
      const zoomInBtn = document.getElementById('section-zoom-in')
      if (zoomInBtn) {
        zoomInBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.zoomIn()
        })
      }

      // Zoom Out
      const zoomOutBtn = document.getElementById('section-zoom-out')
      if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.zoomOut()
        })
      }

      // Reset View
      const resetBtn = document.getElementById('section-reset-view')
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.resetView()
        })
      }

      // Fit to View
      const fitBtn = document.getElementById('section-fit-view')
      if (fitBtn) {
        fitBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          this.fitToView()
        })
      }
    }, 100)
  }

  updateZoomIndicator() {
    const zoomLevel = document.getElementById('section-zoom-level')
    if (zoomLevel) {
      // Garantir que o zoom seja um número válido
      const zoomValue = Math.max(0.1, Math.min(2, this.currentZoom || 1))
      zoomLevel.textContent = `${Math.round(zoomValue * 100)}%`
    }
  }

  updateMousePosition(event) {
    const mouseX = document.getElementById('section-mouse-x')
    const mouseY = document.getElementById('section-mouse-y')
    
    if (mouseX && mouseY) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = Math.round(event.clientX - rect.left)
      const y = Math.round(event.clientY - rect.top)
      
      mouseX.textContent = x
      mouseY.textContent = y
    }
  }

  zoomIn() {
    if (this.svg && this.zoomBehavior) {
      const currentTransform = d3.zoomTransform(this.svg.node())
      const newScale = Math.min(currentTransform.k * 1.5, 2)
      
      console.log('Zoom In - Current:', currentTransform.k, 'New:', newScale)
      
      // Criar nova transformação mantendo a posição atual
      const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(newScale)
      
      this.svg.transition().duration(300).call(
        this.zoomBehavior.transform,
        newTransform
      )
      
      // Atualizar estado interno
      this.zoomTransform = newTransform
      this.currentZoom = newScale
      this.updateZoomIndicator()
    }
  }

  zoomOut() {
    if (this.svg && this.zoomBehavior) {
      const currentTransform = d3.zoomTransform(this.svg.node())
      const newScale = Math.max(currentTransform.k / 1.5, 0.2)
      
      console.log('Zoom Out - Current:', currentTransform.k, 'New:', newScale)
      
      // Criar nova transformação mantendo a posição atual
      const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(newScale)
      
      this.svg.transition().duration(300).call(
        this.zoomBehavior.transform,
        newTransform
      )
      
      // Atualizar estado interno
      this.zoomTransform = newTransform
      this.currentZoom = newScale
      this.updateZoomIndicator()
    }
  }

  resetView() {
    if (this.svg && this.zoomBehavior) {
      // Reset para zoom 100% e posição central
      const resetTransform = d3.zoomIdentity
      
      this.svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        resetTransform
      )
      
      // Atualizar estado interno
      this.zoomTransform = resetTransform
      this.currentZoom = 1
      this.updateZoomIndicator()
    }
  }

  fitToView() {
    if (this.svg && this.graphData && this.zoomBehavior) {
      const container = document.getElementById('section-graph-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height

      // Calcular bounds dos nós
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      this.graphData.nodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
          minX = Math.min(minX, node.x)
          minY = Math.min(minY, node.y)
          maxX = Math.max(maxX, node.x)
          maxY = Math.max(maxY, node.y)
        }
      })

      if (minX === Infinity) return

      // Obter zoom atual
      const currentTransform = d3.zoomTransform(this.svg.node())
      const currentZoom = currentTransform.k

      // Calcular centro do grafo
      const graphCenterX = (minX + maxX) / 2
      const graphCenterY = (minY + maxY) / 2

      // Calcular centro do container
      const containerCenterX = containerWidth / 2
      const containerCenterY = containerHeight / 2

      // Calcular translação para centralizar o grafo mantendo o zoom atual
      const translateX = containerCenterX - graphCenterX * currentZoom
      const translateY = containerCenterY - graphCenterY * currentZoom

      // Criar nova transformação mantendo o zoom atual
      const newTransform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(currentZoom)

      // Aplicar transformação
      this.svg.transition().duration(750).call(
        this.zoomBehavior.transform,
        newTransform
      )
      
      // Atualizar estado interno (mantendo o zoom atual)
      this.zoomTransform = newTransform
      this.currentZoom = currentZoom
      this.updateZoomIndicator()
    }
  }

  hideInfoCard() {
    const infoCard = document.getElementById('section-node-info-card')
    if (infoCard) {
      infoCard.style.opacity = '0'
      infoCard.style.pointerEvents = 'none'
      infoCard.style.transform = 'scale(0.95)'
      
      // Remover classe de animação
      infoCard.classList.remove('scale-100')
      infoCard.classList.add('scale-95')
    }
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
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            <span class="text-gray-500 dark:text-gray-400">${posts.length}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span class="text-gray-500 dark:text-gray-400">${links.length}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span class="text-gray-500 dark:text-gray-400">${categoryConnections}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
            <span class="text-gray-500 dark:text-gray-400">${tagConnections}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            <span class="text-gray-500 dark:text-gray-400">${bothConnections}</span>
          </div>
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
    
    // Limpar comportamento de zoom
    if (this.zoomBehavior) {
      this.zoomBehavior = null
    }
    
    // Limpar observer se existir
    if (this.themeObserver) {
      this.themeObserver.disconnect()
    }
  }
} 