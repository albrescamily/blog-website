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

// Importações dos serviços
import { PostService } from './services/PostService.js'

// Importações dos utilitários
import { Translations } from './utils/Translations.js'
import { ThemeManager } from './utils/ThemeManager.js'

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
    marked.setOptions({
      breaks: true,
      gfm: true
    })
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    try {
      // Carrega os posts
      await this.postService.loadPosts()
      
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
    spacer.className = 'h-16'
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
    
    if (this.filterCategories.length > 0 && this.filterTags.length > 0) {
      title.textContent = `${this.translations.t('categories')}: ${this.filterCategories.join(', ')} + ${this.translations.t('tags')}: ${this.filterTags.join(', ')}`
    } else if (this.filterCategories.length > 0) {
      title.textContent = `${this.translations.t('categories')}: ${this.filterCategories.join(', ')}`
    } else if (this.filterTags.length > 0) {
      title.textContent = `${this.translations.t('tags')}: ${this.filterTags.join(', ')}`
    } else if (this.searchTerm) {
      title.textContent = `${this.translations.t('search')}: "${this.searchTerm}"`
    } else {
      title.textContent = this.translations.t('blogPosts')
    }
    
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

    // Container principal minimalista e centralizado
    const content = document.createElement('div')
    content.className = 'min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200'

    // Botão de voltar para posts do blog
    const backBtn = document.createElement('button')
    backBtn.className = 'btn-secondary mb-8 self-start'
    backBtn.textContent = '← Voltar para Posts do Blog'
    backBtn.onclick = () => {
      this.navigateToView('list')
    }
    content.appendChild(backBtn)

    // Wrapper centralizado
    const wrapper = document.createElement('div')
    wrapper.className = 'w-full max-w-2xl mx-auto flex flex-col items-center px-4'

    // Título grande e centralizado
    const title = document.createElement('h1')
    title.className = 'text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-2 text-center'
    title.textContent = post.title
    wrapper.appendChild(title)

    // Data em itálico
    const date = document.createElement('div')
    date.className = 'text-lg text-gray-500 dark:text-gray-400 italic mb-8 text-center'
    date.textContent = post.date
    wrapper.appendChild(date)

    // Categorias e tags
    const categories = this.renderPostCategories(post)
    categories.className += ' justify-center mb-8'
    wrapper.appendChild(categories)

    // Conteúdo do post
    const postContent = document.createElement('div')
    postContent.className = 'prose prose-lg max-w-none text-left w-full'
    postContent.innerHTML = DOMPurify.sanitize(marked.parse(post.content))
    wrapper.appendChild(postContent)

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
    searchContainer.className = 'max-w-md mx-auto'
    
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = this.translations.t('searchPlaceholder')
    searchInput.value = this.searchTerm
    searchInput.className = 'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200'
    
    searchInput.addEventListener('input', (e) => {
      this.setSearchTerm(e.target.value)
    })
    
    searchContainer.appendChild(searchInput)
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
    homeLink.className = 'hover:underline hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200'
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
      categorySpan.className = 'text-purple-600 dark:text-purple-400'
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
    
    // Imagem
    const imageContainer = document.createElement('div')
    imageContainer.className = 'h-56 w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden rounded-t-2xl'
    
    if (post.image) {
      const img = document.createElement('img')
      img.src = post.image
      img.alt = post.title
      img.className = 'object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
      imageContainer.appendChild(img)
    } else {
      const placeholder = document.createElement('span')
      placeholder.className = 'text-gray-400 dark:text-gray-500 text-3xl'
      placeholder.textContent = '🖼️'
      imageContainer.appendChild(placeholder)
    }
    
    article.appendChild(imageContainer)
    
    // Conteúdo
    const content = document.createElement('div')
    content.className = 'flex-1 flex flex-col p-8'
    
    const title = document.createElement('h2')
    title.className = 'text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200 leading-tight'
    title.textContent = post.title
    
    const meta = document.createElement('div')
    meta.className = 'flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3'
    meta.innerHTML = `<span>👤 ${post.author || this.translations.t('author')}</span><span>•</span><span>📅 ${post.date}</span>`
    
    const categories = this.renderPostCardCategories(post)
    
    const excerpt = document.createElement('div')
    excerpt.className = 'text-gray-600 dark:text-gray-300 text-base leading-relaxed text-truncate-3 mb-6'
    excerpt.innerHTML = DOMPurify.sanitize(marked.parse(post.content.split('\n').slice(0, 6).join(' ')))
    
    const readMore = document.createElement('button')
    readMore.className = 'btn-primary mt-auto w-fit'
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
        btn.onclick = e => {
          e.stopPropagation()
          this.toggleCategoryFilter(cat)
        }
        container.appendChild(btn)
      })
    }
    
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach(tag => {
        const btn = document.createElement('button')
        btn.className = 'btn-tag-blue'
        btn.textContent = tag
        btn.onclick = e => {
          e.stopPropagation()
          this.toggleTagFilter(tag)
        }
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
    container.className = 'flex flex-wrap gap-2 mb-2'
    
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
   * Renderiza seção de categorias
   */
  renderCategoriesSection() {
    const section = document.createElement('div')
    section.className = 'sidebar-card mb-8'
    
    const title = document.createElement('h3')
    title.className = 'text-xl font-semibold text-gray-900 dark:text-white mb-6'
    title.textContent = this.translations.t('categories')
    
    const list = document.createElement('div')
    list.className = 'space-y-3'
    
    this.postService.getCategories().forEach(category => {
      const btn = document.createElement('button')
      const isActive = this.filterCategories.includes(category.name)
      btn.className = `w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shadow-md' 
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
          ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' 
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