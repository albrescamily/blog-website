/**
 * Main Application
 * Aplicação principal
 */

import './style.css'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Importações dos componentes
import { Header } from './components/Header.js'
import { Footer } from './components/Footer.js'
import { HomePage } from './components/HomePage.js'
import { GraphSection } from './components/GraphSection.js'

// Importações dos serviços
import { PostService } from './services/PostService.js'

// Importações dos utilitários
import { Translations } from './utils/Translations.js'
import { ThemeManager } from './utils/ThemeManager.js'
import { HeadingExtractor } from './utils/HeadingExtractor.js'

/**
 * Exemplo de uso do HeadingExtractor:
 * 
 * // Extrair headings
 * const headings = HeadingExtractor.extractHeadings(content)
 * 
 * // Validar headings
 * const validHeadings = headings.filter(HeadingExtractor.isValidHeading)
 * 
 * // Filtrar por nível
 * const h2h3 = HeadingExtractor.filterByLevel(headings, 2, 3)
 * 
 * // Criar hierarquia
 * const hierarchy = HeadingExtractor.createHierarchy(headings)
 * 
 * // Obter estatísticas
 * const stats = HeadingExtractor.getStatistics(headings)
 */

/**
 * Classe principal da aplicação
 */
class BlogApp {
  constructor() {
    // Inicialização dos serviços
    this.postService = new PostService()
    this.translations = new Translations()
    this.themeManager = new ThemeManager()
    
    // Inicialização dos componentes
    this.header = new Header()
    this.footer = new Footer()
    this.graphSection = new GraphSection()
    
    // Estado da aplicação
    this.currentView = 'home'
    this.currentPostId = null
    this.filterCategories = []
    this.filterTags = []
    this.searchTerm = ''
    
    // Configuração do marked
    this.setupMarked()
    
    // Inicialização
    this.init()
  }

  /**
   * Configura o parser de Markdown
   */
  setupMarked() {
    // Configuração para marked v9+
    marked.use({
      breaks: true,
      gfm: true,
      renderer: {
        heading(text, level) {
          const id = HeadingExtractor.generateHeadingId(text)
          return `<h${level} id="${id}">${text}</h${level}>`
        }
      }
    })
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    try {
      // Carrega os posts
      await this.postService.loadPosts()
      
      // Inicializa a seção de grafos
      await this.graphSection.init()
      
      // Configura os event listeners
      this.setupEventListeners()
      
      // Renderiza a aplicação
      this.render()
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error)
    }
  }

  /**
   * Configura os event listeners
   */
  setupEventListeners() {
    // Navegação
    window.addEventListener('navigation', (e) => {
      this.navigateToView(e.detail.view)
    })

    // Visualização de post
    window.addEventListener('postView', (e) => {
      this.viewPost(e.detail.postId)
    })

    // Filtros
    window.addEventListener('categoryFilter', (e) => {
      this.toggleCategoryFilter(e.detail.category)
    })

    window.addEventListener('tagFilter', (e) => {
      this.toggleTagFilter(e.detail.tag)
    })

    // Busca
    window.addEventListener('searchFilter', (e) => {
      this.setSearchTerm(e.detail.term)
    })

    // Dark mode
    window.addEventListener('darkModeToggle', () => {
      this.themeManager.toggle()
      this.updateHeaderState()
    })

    // Mudança de idioma
    window.addEventListener('languageChange', (e) => {
      this.translations.setLanguage(e.detail.language)
      this.render()
    })

    // Mudança de tema
    window.addEventListener('themeChange', () => {
      this.updateHeaderState()
    })
  }

  /**
   * Navega para uma view específica
   */
  navigateToView(view) {
    this.currentView = view
    this.clearFilters()
    this.render()
  }

  /**
   * Visualiza um post específico
   */
  viewPost(postId) {
    this.currentPostId = postId
    this.currentView = 'post'
    this.clearFilters()
    this.render()
  }

  /**
   * Alterna filtro de categoria (múltipla seleção)
   */
  toggleCategoryFilter(category) {
    const index = this.filterCategories.indexOf(category)
    if (index > -1) {
      this.filterCategories.splice(index, 1)
    } else {
      this.filterCategories.push(category)
    }
    this.currentView = 'list'
    this.render()
  }

  /**
   * Alterna filtro de tag (múltipla seleção)
   */
  toggleTagFilter(tag) {
    const index = this.filterTags.indexOf(tag)
    if (index > -1) {
      this.filterTags.splice(index, 1)
    } else {
      this.filterTags.push(tag)
    }
    this.currentView = 'list'
    this.render()
  }

  /**
   * Define termo de busca
   */
  setSearchTerm(term) {
    this.searchTerm = term
    this.currentView = 'list'
    this.render()
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.filterCategories = []
    this.filterTags = []
    this.searchTerm = ''
    this.render()
  }

  /**
   * Atualiza o estado do header
   */
  updateHeaderState() {
    this.header.updateState({
      currentView: this.currentView,
      isDarkMode: this.themeManager.isDark(),
      currentLanguage: this.translations.getCurrentLanguage()
    })
  }

  /**
   * Renderiza a aplicação
   */
  render() {
    const app = document.querySelector('#app')
    if (!app) return

    // Limpa o conteúdo atual
    app.innerHTML = ''
    
    // Atualiza o estado do header
    this.updateHeaderState()
    
    // Renderiza o header
    const header = this.header.render(this.translations.t.bind(this.translations))
    app.appendChild(header)
    
    // Adiciona espaçador para o header fixo
    const spacer = document.createElement('div')
    spacer.className = 'h-20'
    app.appendChild(spacer)
    
    // Renderiza o conteúdo principal
    const main = document.createElement('main')
    main.id = 'main-content'
    app.appendChild(main)
    
    // Renderiza o conteúdo baseado na view atual
    this.renderMainContent(main)
    
    // Renderiza o footer
    const footer = this.footer.render(this.translations.t.bind(this.translations))
    app.appendChild(footer)
  }

  /**
   * Renderiza o conteúdo principal
   */
  renderMainContent(container) {
    switch (this.currentView) {
      case 'home':
        this.renderHome(container)
        break
      case 'list':
        this.renderPostList(container)
        break
      case 'post':
        this.renderPostView(container)
        break
      default:
        this.renderHome(container)
    }
  }

  /**
   * Renderiza a página inicial
   */
  renderHome(container) {
    const homePage = new HomePage(this.postService.getAllPosts())
    const content = homePage.render(this.translations.t.bind(this.translations))
    container.appendChild(content)
    
    // Adiciona a seção de grafos
    const graphSection = this.graphSection.render()
    container.appendChild(graphSection)
  }

  /**
   * Renderiza a lista de posts
   */
  renderPostList(container) {
    const filteredPosts = this.postService.getFilteredPosts(this.filterCategories, this.filterTags, this.searchTerm)
    
    const content = document.createElement('div')
    content.className = 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200'
    
    const wrapper = document.createElement('div')
    wrapper.className = 'max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-4 gap-10'
    
    const main = document.createElement('main')
    main.className = 'lg:col-span-3'
    
    // Navegação breadcrumb
    const navigation = this.renderBreadcrumb()
    main.appendChild(navigation)
    
    // Campo de busca
    const searchSection = this.renderSearchSection()
    main.appendChild(searchSection)
    
    // Título
    const title = document.createElement('h1')
    title.className = 'text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-8 text-center'
    title.textContent = this.translations.t('blogPosts')
    
    main.appendChild(title)
    
    // Grid de posts
    const postsGrid = document.createElement('div')
    postsGrid.className = 'posts-grid'
    
    if (filteredPosts.length === 0) {
      const noPosts = document.createElement('p')
      noPosts.className = 'text-gray-600 dark:text-gray-400 text-center col-span-2'
      noPosts.textContent = this.translations.t('noPostsFound')
      postsGrid.appendChild(noPosts)
    } else {
      filteredPosts.forEach(post => {
        const postCard = this.renderPostCard(post)
        postsGrid.appendChild(postCard)
      })
    }
    
    main.appendChild(postsGrid)
    wrapper.appendChild(main)
    
    // Sidebar
    const sidebar = this.renderSidebar()
    wrapper.appendChild(sidebar)
    
    content.appendChild(wrapper)
    container.appendChild(content)
  }

  /**
   * Renderiza a visualização de um post
   */
  renderPostView(container) {
    const post = this.postService.getPostById(this.currentPostId)
    if (!post) {
      this.currentView = 'list'
      this.render()
      return
    }
    
    // Container principal com layout de grid
    const content = document.createElement('div')
    content.className = 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200'
    
    // Botão de voltar para posts do blog
    const backBtn = document.createElement('button')
    backBtn.className = 'btn-secondary mb-8 ml-6 mt-6'
    backBtn.textContent = '← Voltar para Posts do Blog'
    backBtn.onclick = () => {
      this.navigateToView('list')
    }
    content.appendChild(backBtn)

    // Wrapper com grid layout
    const wrapper = document.createElement('div')
    wrapper.className = 'max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-4 gap-10'

    // Conteúdo principal
    const main = document.createElement('main')
    main.className = 'lg:col-span-3'

    // Título grande e centralizado
    const title = document.createElement('h1')
    title.className = 'text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 text-center lg:text-left'
    title.textContent = post.title
    main.appendChild(title)
    
    // Data em itálico
    const date = document.createElement('div')
    date.className = 'text-lg text-gray-500 dark:text-gray-400 italic mb-6 text-center lg:text-left'
    date.textContent = post.date
    main.appendChild(date)
    
    // Categorias e tags
    const categories = this.renderPostCategories(post)
    categories.className += ' justify-center lg:justify-start mb-8'
    main.appendChild(categories)
    
    // Conteúdo do post
    const postContent = document.createElement('div')
    postContent.className = 'prose prose-lg max-w-none text-left w-full'
    postContent.innerHTML = DOMPurify.sanitize(marked.parse(post.content))
    main.appendChild(postContent)
    
    // Configura o observer de interseção para headings
    this.setupIntersectionObserver()
    
    wrapper.appendChild(main)
    
    // Sidebar com tabela de conteúdo
    const sidebar = this.renderPostSidebar(post)
    wrapper.appendChild(sidebar)
    
    content.appendChild(wrapper)
    container.appendChild(content)
  }

  /**
   * Renderiza seção de busca
   */
  renderSearchSection() {
    const section = document.createElement('div')
    section.className = 'mb-8'
    
    const searchContainer = document.createElement('div')
    searchContainer.className = 'max-w-md mx-auto relative'
    
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = this.translations.t('searchPlaceholder')
    searchInput.value = this.searchTerm
    searchInput.className = 'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200'
    
    // Sugestões
    const suggestionsBox = document.createElement('div')
    suggestionsBox.className = 'absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto hidden'
    
    let suggestions = []
    let lastInputValue = searchInput.value
    
    // Atualiza sugestões enquanto digita
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value
      lastInputValue = value
      if (value.trim() === '') {
        suggestionsBox.innerHTML = ''
        suggestionsBox.classList.add('hidden')
        return
      }
      // Busca sugestões (máx 5)
      suggestions = this.postService.searchPosts(value).slice(0, 5)
      if (suggestions.length === 0) {
        suggestionsBox.innerHTML = `<div class='px-4 py-2 text-gray-400'>Nenhum resultado</div>`
        suggestionsBox.classList.remove('hidden')
        return
      }
      suggestionsBox.innerHTML = ''
      suggestions.forEach(post => {
        const item = document.createElement('div')
        item.className = 'px-4 py-2 cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-900 text-left text-gray-900 dark:text-white rounded'
        item.textContent = post.title
        item.onclick = () => {
          searchInput.value = post.title
          lastInputValue = post.title
          suggestionsBox.classList.add('hidden')
          searchInput.focus()
        }
        suggestionsBox.appendChild(item)
      })
      suggestionsBox.classList.remove('hidden')
    })
    
    // Esconde sugestões ao perder foco
    searchInput.addEventListener('blur', () => {
      setTimeout(() => suggestionsBox.classList.add('hidden'), 150)
    })
    searchInput.addEventListener('focus', () => {
      if (suggestionsBox.innerHTML && lastInputValue.trim() !== '') {
        suggestionsBox.classList.remove('hidden')
      }
    })
    
    // Busca ao pressionar Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.setSearchTerm(searchInput.value)
      }
    })
    
    // Botão de busca
    const searchBtn = document.createElement('button')
    searchBtn.type = 'button'
    searchBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors duration-200'
    searchBtn.textContent = 'Buscar'
    searchBtn.onclick = () => {
      this.setSearchTerm(searchInput.value)
    }
    
    searchContainer.appendChild(searchInput)
    searchContainer.appendChild(searchBtn)
    searchContainer.appendChild(suggestionsBox)
    section.appendChild(searchContainer)
    
    return section
  }

  /**
   * Renderiza breadcrumb para lista de posts
   */
  renderBreadcrumb() {
    const nav = document.createElement('nav')
    nav.className = 'text-gray-500 dark:text-gray-400 text-sm mb-2 flex gap-2 items-center'
    
    const homeLink = document.createElement('a')
    homeLink.href = '#'
    homeLink.className = 'hover:underline hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200'
    homeLink.textContent = this.translations.t('home')
    homeLink.onclick = e => {
      e.preventDefault()
      this.navigateToView('home')
    }
    
    const separator1 = document.createElement('span')
    separator1.textContent = '/'
    
    const blogSpan = document.createElement('span')
    blogSpan.className = 'text-gray-900 dark:text-white font-medium'
    blogSpan.textContent = this.translations.t('blogPosts')
    
    nav.appendChild(homeLink)
    nav.appendChild(separator1)
    nav.appendChild(blogSpan)
    
    if (this.filterCategories.length > 0) {
      const separator2 = document.createElement('span')
      separator2.textContent = '/'
      
      const categorySpan = document.createElement('span')
      categorySpan.className = 'text-cyan-600 dark:text-cyan-400'
      categorySpan.textContent = this.filterCategories.join(', ')
      
      nav.appendChild(separator2)
      nav.appendChild(categorySpan)
    }
    
    if (this.filterTags.length > 0) {
      const separator3 = document.createElement('span')
      separator3.textContent = '/'
      
      const tagSpan = document.createElement('span')
      tagSpan.className = 'text-blue-600 dark:text-blue-400'
      tagSpan.textContent = this.filterTags.join(', ')
      
      nav.appendChild(separator3)
      nav.appendChild(tagSpan)
    }
    
    return nav
  }

  /**
   * Renderiza um card de post
   */
  renderPostCard(post) {
    const article = document.createElement('article')
    article.className = 'card group cursor-pointer'
    article.onclick = () => {
      this.viewPost(post.id)
    }
    
    // Conteúdo
    const content = document.createElement('div')
    content.className = 'flex-1 flex flex-col p-8 h-full'
    
    const title = document.createElement('h2')
    title.className = 'text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 leading-tight'
    title.textContent = post.title
    
    const meta = document.createElement('div')
    meta.className = 'flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4'
    meta.innerHTML = `<span>${post.date}</span>`
    
    const categories = this.renderPostCardCategories(post)
    
    const excerpt = document.createElement('div')
    excerpt.className = 'text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-1 overflow-hidden'
    excerpt.innerHTML = DOMPurify.sanitize(marked.parse(post.content.split('\n').slice(0, 8).join(' ')))
    
    const readMore = document.createElement('button')
    readMore.className = 'btn-primary w-fit text-sm px-4 py-2 mt-auto'
    readMore.textContent = this.translations.t('readMore')
    readMore.onclick = e => {
      e.stopPropagation()
      this.viewPost(post.id)
    }
    
    content.appendChild(title)
    content.appendChild(meta)
    content.appendChild(categories)
    content.appendChild(excerpt)
    content.appendChild(readMore)
    
    article.appendChild(content)
    return article
  }

  /**
   * Renderiza categorias de um post
   */
  renderPostCategories(post) {
    const container = document.createElement('div')
    container.className = 'flex flex-wrap gap-2 mb-2'
    
    if (post.categories && post.categories.length > 0) {
      post.categories.forEach(cat => {
        const btn = document.createElement('button')
        btn.className = 'btn-tag'
        btn.textContent = cat
        // Removido onclick para não permitir interação na visualização do post
        container.appendChild(btn)
      })
    }
    
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => {
        const btn = document.createElement('button')
        btn.className = 'btn-tag-blue'
        btn.textContent = tag
        // Removido onclick para não permitir interação na visualização do post
        container.appendChild(btn)
      })
    }
    
    return container
  }

  /**
   * Renderiza categorias de um card de post
   */
  renderPostCardCategories(post) {
    const container = document.createElement('div')
    container.className = 'flex flex-wrap gap-2 mb-4'
    
    if (post.categories && post.categories.length > 0) {
      post.categories.slice(0, 2).forEach(cat => {
        const btn = document.createElement('button')
        btn.className = 'btn-tag text-xs'
        btn.textContent = cat
        btn.onclick = e => {
          e.stopPropagation()
          this.toggleCategoryFilter(cat)
        }
        container.appendChild(btn)
      })
    }
    
    return container
  }

  /**
   * Renderiza a sidebar
   */
  renderSidebar() {
    const sidebar = document.createElement('aside')
    sidebar.className = 'lg:col-span-1'
    
    // Categorias
    const categoriesSection = this.renderCategoriesSection()
    sidebar.appendChild(categoriesSection)
    
    // Tags
    const tagsSection = this.renderTagsSection()
    sidebar.appendChild(tagsSection)
    
    return sidebar
  }

  /**
   * Renderiza a sidebar específica para visualização de post
   */
  renderPostSidebar(post) {
    const sidebar = document.createElement('aside')
    sidebar.className = 'lg:col-span-1'
    
    // Tabela de conteúdo
    const tableOfContents = this.renderTableOfContents(post)
    sidebar.appendChild(tableOfContents)
    
    return sidebar
  }

  /**
   * Renderiza seção de categorias
   */
  renderCategoriesSection() {
    const section = document.createElement('div')
    section.className = 'sidebar-card mb-8'
    
    const title = document.createElement('h3')
    title.className = 'text-xl font-semibold text-gray-900 dark:text-white mb-6'
    title.textContent = this.translations.t('categories')
    
    // Botão Clear All (só aparece se há categorias selecionadas)
    if (this.filterCategories.length > 0) {
      const clearAllWrapper = document.createElement('div')
      clearAllWrapper.className = 'flex justify-end mb-3'
      
      const clearAllBtn = document.createElement('button')
      clearAllBtn.className = 'w-fit px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200'
      clearAllBtn.textContent = this.translations.t('clearAll')
      clearAllBtn.onclick = () => {
        this.clearFilters()
      }
      
      clearAllWrapper.appendChild(clearAllBtn)
      section.appendChild(clearAllWrapper)
    }
    
    const list = document.createElement('div')
    list.className = 'space-y-3'
    
    this.postService.getCategories().forEach(category => {
      const btn = document.createElement('button')
      const isActive = this.filterCategories.includes(category.name)
      btn.className = `w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 shadow-md' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`
      
      // Cria o conteúdo do botão com contador
      const content = document.createElement('div')
      content.className = 'flex items-center justify-between'
      
      const name = document.createElement('span')
      name.textContent = category.name
      
      const count = document.createElement('span')
      count.className = `text-xs px-3 py-1 rounded-full font-semibold ${
        isActive 
          ? 'bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`
      count.textContent = category.count
      
      content.appendChild(name)
      content.appendChild(count)
      btn.appendChild(content)
      
      btn.onclick = () => {
        this.toggleCategoryFilter(category.name)
      }
      list.appendChild(btn)
    })
    
    section.appendChild(title)
    section.appendChild(list)
    return section
  }

  /**
   * Renderiza a tabela de conteúdo
   */
  renderTableOfContents(post) {
    const section = document.createElement('div')
    section.className = 'table-of-contents sticky top-20'
    
    const title = document.createElement('h3')
    title.textContent = this.translations.t('tableOfContents')
    
    const list = document.createElement('div')
    list.className = 'space-y-1'
    
    // Extrai headings do conteúdo do post
    const headings = HeadingExtractor.extractHeadings(post.content)
    
    // Valida se há headings válidos
    const validHeadings = headings.filter(HeadingExtractor.isValidHeading)
    
    if (validHeadings.length === 0) {
      const noHeadings = document.createElement('p')
      noHeadings.className = 'text-gray-500 dark:text-gray-400 text-sm italic'
      noHeadings.textContent = this.translations.t('onThisPage')
      list.appendChild(noHeadings)
    } else {
      // Filtra apenas headings de nível 2-6 para a tabela de conteúdo
      const tocHeadings = HeadingExtractor.filterByLevel(validHeadings, 2, 6)
      
      tocHeadings.forEach(heading => {
        const link = document.createElement('a')
        link.href = `#${heading.id}`
        link.className = `heading-h${heading.level}`
        link.textContent = heading.text
        link.title = `${heading.text} (Nível ${heading.level})`
        link.style.paddingLeft = `${(heading.level - 2) * 1}rem`
        link.onclick = (e) => {
          e.preventDefault()
          this.scrollToHeading(heading.id)
          this.updateActiveHeading(heading.id)
        }
        list.appendChild(link)
      })
    }
    
    section.appendChild(title)
    section.appendChild(list)
    return section
  }



  /**
   * Faz scroll suave para o heading
   */
  scrollToHeading(headingId) {
    const element = document.getElementById(headingId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  /**
   * Atualiza o heading ativo na tabela de conteúdo
   */
  updateActiveHeading(headingId) {
    // Remove classe active de todos os links
    const allLinks = document.querySelectorAll('.table-of-contents a')
    allLinks.forEach(link => link.classList.remove('active'))
    
    // Adiciona classe active ao link clicado
    const activeLink = document.querySelector(`.table-of-contents a[href="#${headingId}"]`)
    if (activeLink) {
      activeLink.classList.add('active')
    }
  }

  /**
   * Configura o observer de interseção para detectar headings visíveis
   */
  setupIntersectionObserver() {
    const headings = document.querySelectorAll('.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id], .prose h5[id], .prose h6[id]')
    
    if (headings.length === 0) return
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const headingId = entry.target.id
          this.updateActiveHeading(headingId)
        }
      })
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    })
    
    headings.forEach(heading => {
      observer.observe(heading)
    })
  }

  /**
   * Renderiza seção de tags
   */
  renderTagsSection() {
    const section = document.createElement('div')
    section.className = 'sidebar-card'
    
    const title = document.createElement('h3')
    title.className = 'text-xl font-semibold text-gray-900 dark:text-white mb-6'
    title.textContent = this.translations.t('tags')
    
    const list = document.createElement('div')
    list.className = 'flex flex-wrap gap-2'
    
    // Se há categorias selecionadas, mostra apenas tags dessas categorias
    const tagsToShow = this.filterCategories.length > 0 
      ? this.postService.getTagsForCategories(this.filterCategories)
      : this.postService.getTags()
    
    tagsToShow.forEach(tag => {
      const btn = document.createElement('button')
      const isActive = this.filterTags.includes(tag.name)
      btn.className = `btn-tag-blue text-xs ${
        isActive 
          ? 'bg-blue-600 dark:bg-blue-500 text-white' 
          : ''
      }`
      
      // Adiciona contador à tag
      btn.textContent = `${tag.name} (${tag.count})`
      btn.onclick = () => {
        this.toggleTagFilter(tag.name)
      }
      list.appendChild(btn)
    })
    
    section.appendChild(title)
    section.appendChild(list)
    return section
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new BlogApp()
}) 