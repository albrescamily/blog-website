import * as d3 from 'd3'
import { PostService } from '../services/PostService.js'

export class GraphPage {
  constructor() {
    this.postService = new PostService()
    this.graphData = null
    this.simulation = null
    this.svg = null
    this.width = 1200
    this.height = 800
    this.nodeRadius = 8
    this.linkDistance = 100
  }

  async init() {
    await this.postService.loadPosts()
    this.prepareGraphData()
    this.createGraph()
    this.setupControls()
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
        size: 6,
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
        size: 10,
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
        size: 8,
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

  createGraph() {
    const container = document.getElementById('graph-container')
    if (!container) return

    // Limpar container
    container.innerHTML = ''

    // Criar SVG
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('border', '1px solid #e5e7eb')
      .style('background', '#f9fafb')

    // Criar grupo para zoom
    const g = this.svg.append('g')

    // Adicionar zoom
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    this.svg.call(zoom)

    // Criar força de simulação
    this.simulation = d3.forceSimulation(this.graphData.nodes)
      .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(this.linkDistance))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5))

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
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)

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
      .attr('stroke-width', 2)

    // Adicionar labels aos nós
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 15)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .style('pointer-events', 'none')

    // Adicionar tooltips
    node.append('title')
      .text(d => {
        switch (d.type) {
          case 'post': return `Post: ${d.label}\nAutor: ${d.data.author}\nData: ${d.data.date}`
          case 'category': return `Categoria: ${d.label}\nPosts: ${d.data.count}`
          case 'tag': return `Tag: ${d.label}\nPosts: ${d.data.count}`
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
    console.log('Nó clicado:', node)
    
    // Mostrar informações do nó
    const infoContainer = document.getElementById('node-info')
    if (infoContainer) {
      let info = `<h3 class="text-lg font-bold mb-2">${node.label}</h3>`
      
      switch (node.type) {
        case 'post':
          info += `
            <p><strong>Autor:</strong> ${node.data.author}</p>
            <p><strong>Data:</strong> ${node.data.date}</p>
            <p><strong>Categorias:</strong> ${node.data.categories?.join(', ') || 'Nenhuma'}</p>
            <p><strong>Tags:</strong> ${node.data.tags?.join(', ') || 'Nenhuma'}</p>
          `
          break
        case 'category':
          info += `<p><strong>Posts:</strong> ${node.data.count}</p>`
          break
        case 'tag':
          info += `<p><strong>Posts:</strong> ${node.data.count}</p>`
          break
      }
      
      infoContainer.innerHTML = info
    }
  }

  highlightNode(selectedNode) {
    // Destacar nó selecionado e seus vizinhos
    const connectedNodes = new Set()
    const connectedLinks = []

    this.graphData.links.forEach(link => {
      if (link.source.id === selectedNode.id || link.target.id === selectedNode.id) {
        connectedNodes.add(link.source.id)
        connectedNodes.add(link.target.id)
        connectedLinks.push(link)
      }
    })

    // Aplicar opacidade aos nós
    this.svg.selectAll('.node').style('opacity', d => 
      connectedNodes.has(d.id) ? 1 : 0.3
    )

    // Aplicar opacidade aos links
    this.svg.selectAll('line').style('opacity', d => 
      connectedLinks.includes(d) ? 1 : 0.1
    )
  }

  resetHighlight() {
    this.svg.selectAll('.node').style('opacity', 1)
    this.svg.selectAll('line').style('opacity', 0.6)
  }

  setupControls() {
    const controlsContainer = document.getElementById('graph-controls')
    if (!controlsContainer) return

    controlsContainer.innerHTML = `
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <h3 class="text-lg font-bold mb-3">Controles do Grafo</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filtro por Tipo</label>
            <select id="type-filter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Todos</option>
              <option value="post">Posts</option>
              <option value="category">Categorias</option>
              <option value="tag">Tags</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Distância dos Links</label>
            <input type="range" id="link-distance" min="50" max="200" value="${this.linkDistance}" class="w-full">
            <span id="distance-value" class="text-sm text-gray-600">${this.linkDistance}</span>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Força de Repulsão</label>
            <input type="range" id="charge-strength" min="-500" max="-100" value="-300" class="w-full">
            <span id="charge-value" class="text-sm text-gray-600">-300</span>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button id="reset-view" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
            Resetar Visualização
          </button>
          <button id="restart-simulation" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Reiniciar Simulação
          </button>
        </div>
      </div>
    `

    // Adicionar event listeners
    document.getElementById('type-filter').addEventListener('change', (e) => {
      this.filterByType(e.target.value)
    })

    document.getElementById('link-distance').addEventListener('input', (e) => {
      const distance = parseInt(e.target.value)
      document.getElementById('distance-value').textContent = distance
      this.updateLinkDistance(distance)
    })

    document.getElementById('charge-strength').addEventListener('input', (e) => {
      const strength = parseInt(e.target.value)
      document.getElementById('charge-value').textContent = strength
      this.updateChargeStrength(strength)
    })

    document.getElementById('reset-view').addEventListener('click', () => {
      this.resetView()
    })

    document.getElementById('restart-simulation').addEventListener('click', () => {
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

  updateChargeStrength(strength) {
    this.simulation.force('charge').strength(strength)
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

  destroy() {
    if (this.simulation) {
      this.simulation.stop()
    }
    if (this.svg) {
      this.svg.remove()
    }
  }
} 