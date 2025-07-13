/**
 * Translations Utility
 * Responsável por gerenciar traduções da aplicação
 */

export class Translations {
  constructor() {
    this.translations = {
      'pt-BR': {
        home: 'Início',
        blogPosts: 'Posts do Blog',
        welcome: 'Bem-vindo ao Meu Blog Minimalista',
        welcomeSubtitle: 'Aqui você encontra artigos, dicas e ideias sobre tecnologia, programação e muito mais. Todos os posts são escritos em Markdown e gerenciados direto pelo VSCode.',
        viewAllPosts: 'Ver todos os posts',
        postCollection: 'Coletânea de Posts',
        categories: 'Categorias',
        tags: 'Tags',
        readMore: 'Ler mais',
        back: 'Voltar',
        noPostsFound: 'Nenhum post encontrado.',
        author: 'Autor',
        allRightsReserved: 'Todos os direitos reservados.',
        madeWith: 'Feito com',
        by: 'por',
        darkMode: 'Modo escuro',
        lightMode: 'Modo claro',
        language: 'Idioma',
        portuguese: 'Português',
        english: 'English',
        search: 'Buscar',
        searchPlaceholder: 'Buscar posts...',
        clearFilters: 'Limpar filtros',
        relatedPosts: 'Posts relacionados',
        sharePost: 'Compartilhar post',
        readingTime: 'Tempo de leitura',
        publishedOn: 'Publicado em',
        category: 'Categoria',
        tag: 'Tag',
        tableOfContents: 'Índice',
        onThisPage: 'Nesta página'
      },
      'en': {
        home: 'Home',
        blogPosts: 'Blog Posts',
        welcome: 'Welcome to My Minimalist Blog',
        welcomeSubtitle: 'Here you find articles, tips and ideas about technology, programming and much more. All posts are written in Markdown and managed directly through VSCode.',
        viewAllPosts: 'View all posts',
        postCollection: 'Post Collection',
        categories: 'Categories',
        tags: 'Tags',
        readMore: 'Read more',
        back: 'Back',
        noPostsFound: 'No posts found.',
        author: 'Author',
        allRightsReserved: 'All rights reserved.',
        madeWith: 'Made with',
        by: 'by',
        darkMode: 'Dark mode',
        lightMode: 'Light mode',
        language: 'Language',
        portuguese: 'Português',
        english: 'English',
        search: 'Search',
        searchPlaceholder: 'Search posts...',
        clearFilters: 'Clear filters',
        relatedPosts: 'Related posts',
        sharePost: 'Share post',
        readingTime: 'Reading time',
        publishedOn: 'Published on',
        category: 'Category',
        tag: 'Tag',
        tableOfContents: 'Table of Contents',
        onThisPage: 'On this page'
      }
    }
    
    const savedLanguage = localStorage.getItem('language') || 'pt-BR'
    // Se o idioma salvo for espanhol (que foi removido), usar português como padrão
    this.currentLanguage = savedLanguage === 'es' ? 'pt-BR' : savedLanguage
  }

  /**
   * Obtém uma tradução
   */
  t(key) {
    return this.translations[this.currentLanguage]?.[key] || 
           this.translations['pt-BR'][key] || 
           key
  }

  /**
   * Muda o idioma atual
   */
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language
      localStorage.setItem('language', language)
      document.documentElement.lang = language
      return true
    }
    return false
  }

  /**
   * Retorna o idioma atual
   */
  getCurrentLanguage() {
    return this.currentLanguage
  }

  /**
   * Retorna todos os idiomas disponíveis
   */
  getAvailableLanguages() {
    return Object.keys(this.translations)
  }

  /**
   * Retorna todas as traduções para um idioma específico
   */
  getTranslationsForLanguage(language) {
    return this.translations[language] || {}
  }

  /**
   * Adiciona uma nova tradução
   */
  addTranslation(language, key, value) {
    if (!this.translations[language]) {
      this.translations[language] = {}
    }
    this.translations[language][key] = value
  }

  /**
   * Remove uma tradução
   */
  removeTranslation(language, key) {
    if (this.translations[language]) {
      delete this.translations[language][key]
    }
  }
} 