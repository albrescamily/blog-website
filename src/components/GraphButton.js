export class GraphButton {
  constructor() {
    this.isVisible = false
  }

  render() {
    const button = document.createElement('button')
    button.id = 'graph-button'
    button.className = `
      fixed bottom-6 right-6 z-40
      bg-gradient-to-r from-blue-500 to-purple-600
      hover:from-blue-600 hover:to-purple-700
      text-white font-medium py-3 px-4 rounded-full
      shadow-lg hover:shadow-xl
      transition-all duration-300 transform hover:scale-105
      flex items-center space-x-2
      group
    `
    
    button.innerHTML = `
      <svg class="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <span class="hidden sm:inline">Relacionamentos</span>
    `

    // Tooltip
    const tooltip = document.createElement('div')
    tooltip.className = `
      absolute bottom-full right-0 mb-2 px-3 py-2
      bg-gray-900 text-white text-sm rounded-lg
      opacity-0 pointer-events-none
      transition-opacity duration-200
      whitespace-nowrap
      group-hover:opacity-100
    `
    tooltip.textContent = 'Visualizar relacionamentos entre posts, categorias e tags'
    
    button.appendChild(tooltip)
    
    return button
  }

  show() {
    if (!this.isVisible) {
      const button = this.render()
      document.body.appendChild(button)
      this.isVisible = true
      
      // Add click event
      button.addEventListener('click', () => {
        this.openGraphWindow()
      })
    }
  }

  hide() {
    const button = document.getElementById('graph-button')
    if (button) {
      button.remove()
      this.isVisible = false
    }
  }

  openGraphWindow() {
    // Dispatch custom event to open graph window
    window.dispatchEvent(new CustomEvent('openGraphWindow'))
  }
} 