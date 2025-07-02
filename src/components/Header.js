/**
 * Header Component
 * Responsável pela renderização do cabeçalho da aplicação
 */

export class Header {
  constructor() {
    this.currentView = 'home'
    this.isDarkMode = false
    this.currentLanguage = 'pt-BR'
  }

  /**
   * Atualiza o estado do componente
   */
  updateState({ currentView, isDarkMode, currentLanguage }) {
    this.currentView = currentView
    this.isDarkMode = isDarkMode
    this.currentLanguage = currentLanguage
  }

  /**
   * Renderiza o componente header
   */
  render(t) {
    const header = document.createElement('header')
    header.className = 'w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 z-50 shadow-sm transition-colors duration-200'
    
    const wrap = document.createElement('div')
    wrap.className = 'max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'

    // Logo
    const logo = this.renderLogo()
    
    // Navegação
    const nav = this.renderNavigation(t)
    
    // Controles (dark mode e idioma)
    const controls = this.renderControls(t)

    wrap.appendChild(logo)
    wrap.appendChild(nav)
    wrap.appendChild(controls)
    header.appendChild(wrap)
    
    return header
  }

  /**
   * Renderiza o logo
   */
  renderLogo() {
    const logo = document.createElement('span')
    logo.className = 'font-bold text-xl text-purple-600 dark:text-purple-400 tracking-tight select-none transition-colors duration-200'
    logo.textContent = 'Camily Blog'
    return logo
  }

  /**
   * Renderiza a navegação principal
   */
  renderNavigation(t) {
    const nav = document.createElement('nav')
    nav.className = 'flex items-center gap-6'

    const linkHome = this.createNavLink(t('home'), 'home', t)
    const linkBlog = this.createNavLink(t('blogPosts'), 'list', t)

    nav.appendChild(linkHome)
    nav.appendChild(linkBlog)
    
    return nav
  }

  /**
   * Cria um link de navegação
   */
  createNavLink(text, view, t) {
    const link = document.createElement('a')
    link.href = '#'
    link.textContent = text
    link.className = `text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 font-medium ${this.currentView === view ? 'underline decoration-purple-600 dark:decoration-purple-400' : ''}`
    
    link.onclick = e => { 
      e.preventDefault()
      this.dispatchNavigationEvent(view)
    }
    
    return link
  }

  /**
   * Renderiza os controles (dark mode e idioma)
   */
  renderControls(t) {
    const controls = document.createElement('div')
    controls.className = 'flex items-center gap-4'

    const darkModeToggle = this.renderDarkModeToggle(t)
    const languageDropdown = this.renderLanguageDropdown(t)

    controls.appendChild(darkModeToggle)
    controls.appendChild(languageDropdown)
    
    return controls
  }

  /**
   * Renderiza o toggle de dark mode
   */
  renderDarkModeToggle(t) {
    const toggleContainer = document.createElement('div')
    toggleContainer.className = 'flex items-center gap-3'
    
    // Label do toggle
    const label = document.createElement('span')
    label.className = 'text-sm text-gray-600 dark:text-gray-400 font-medium'
    label.textContent = t('darkMode')
    
    // Container do toggle
    const toggleWrapper = document.createElement('div')
    toggleWrapper.className = 'toggle-slider'
    if (this.isDarkMode) {
      toggleWrapper.classList.add('active')
    }
    toggleWrapper.onclick = () => this.dispatchDarkModeEvent()
    
    // Thumb do toggle
    const thumb = document.createElement('span')
    thumb.className = 'toggle-thumb'
    
    // Ícone do sol (modo claro)
    const sunIcon = document.createElement('span')
    sunIcon.className = 'toggle-icon sun'
    sunIcon.innerHTML = '☀️'
    
    // Ícone da lua (modo escuro)
    const moonIcon = document.createElement('span')
    moonIcon.className = 'toggle-icon moon'
    moonIcon.innerHTML = '🌙'
    
    toggleWrapper.appendChild(sunIcon)
    toggleWrapper.appendChild(moonIcon)
    toggleWrapper.appendChild(thumb)
    
    toggleContainer.appendChild(label)
    toggleContainer.appendChild(toggleWrapper)
    
    return toggleContainer
  }

  /**
   * Renderiza o dropdown de idioma
   */
  renderLanguageDropdown(t) {
    const languageDropdown = document.createElement('div')
    languageDropdown.className = 'relative'
    
    const languageBtn = document.createElement('button')
    languageBtn.className = 'p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2'
    languageBtn.innerHTML = `🌐 ${this.currentLanguage.toUpperCase()}`
    languageBtn.onclick = (e) => this.toggleLanguageDropdown(e, languageDropdown)
    
    const dropdownMenu = this.renderLanguageMenu(t)
    
    languageDropdown.appendChild(languageBtn)
    languageDropdown.appendChild(dropdownMenu)
    
    // Fecha dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (!languageDropdown.contains(e.target)) {
        dropdownMenu.classList.remove('show')
      }
    })
    
    return languageDropdown
  }

  /**
   * Renderiza o menu de idiomas
   */
  renderLanguageMenu(t) {
    const dropdownMenu = document.createElement('div')
    dropdownMenu.className = 'dropdown-menu absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[120px] z-50'
    
    const languages = [
      { code: 'pt-BR', name: t('portuguese') },
      { code: 'en', name: t('english') },
      { code: 'es', name: t('spanish') }
    ]
    
    languages.forEach(lang => {
      const item = document.createElement('button')
      item.className = `dropdown-item ${this.currentLanguage === lang.code ? 'active' : ''}`
      item.textContent = lang.name
      item.onclick = (e) => {
        e.stopPropagation()
        this.dispatchLanguageEvent(lang.code)
        dropdownMenu.classList.remove('show')
      }
      dropdownMenu.appendChild(item)
    })
    
    return dropdownMenu
  }

  /**
   * Alterna a visibilidade do dropdown de idioma
   */
  toggleLanguageDropdown(e, dropdownContainer) {
    e.stopPropagation()
    const dropdown = dropdownContainer.querySelector('.dropdown-menu')
    if (dropdown) {
      dropdown.classList.toggle('show')
    }
    
    // Fecha outros dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdown) {
        menu.classList.remove('show')
      }
    })
  }

  /**
   * Dispara evento de navegação
   */
  dispatchNavigationEvent(view) {
    window.dispatchEvent(new CustomEvent('navigation', { detail: { view } }))
  }

  /**
   * Dispara evento de dark mode
   */
  dispatchDarkModeEvent() {
    window.dispatchEvent(new CustomEvent('darkModeToggle'))
  }

  /**
   * Dispara evento de mudança de idioma
   */
  dispatchLanguageEvent(language) {
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }))
  }
} 