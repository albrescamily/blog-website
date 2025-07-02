/**
 * ThemeManager
 * Responsável por gerenciar o tema (dark/light mode) da aplicação
 */

export class ThemeManager {
  constructor() {
    this.isDarkMode = this.getInitialTheme()
    this.init()
  }

  /**
   * Obtém o tema inicial baseado nas preferências do usuário
   */
  getInitialTheme() {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return saved === 'true'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * Inicializa o gerenciador de tema
   */
  init() {
    this.applyTheme()
    this.setupMediaQueryListener()
    // Aguarda um pouco para garantir que o DOM esteja pronto
    setTimeout(() => {
      this.updateToggleState()
    }, 100)
  }

  /**
   * Aplica o tema atual
   */
  applyTheme() {
    document.documentElement.classList.toggle('dark', this.isDarkMode)
    localStorage.setItem('darkMode', this.isDarkMode)
  }

  /**
   * Configura listener para mudanças de preferência do sistema
   */
  setupMediaQueryListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        this.isDarkMode = e.matches
        this.applyTheme()
        this.dispatchThemeChangeEvent()
      }
    })
  }

  /**
   * Alterna entre os temas
   */
  toggle() {
    this.isDarkMode = !this.isDarkMode
    this.applyTheme()
    this.dispatchThemeChangeEvent()
    this.updateToggleState()
  }

  /**
   * Atualiza o estado visual do toggle
   */
  updateToggleState() {
    const toggleSlider = document.querySelector('.toggle-slider')
    if (toggleSlider) {
      if (this.isDarkMode) {
        toggleSlider.classList.add('active')
      } else {
        toggleSlider.classList.remove('active')
      }
    }
  }

  /**
   * Define o tema explicitamente
   */
  setTheme(isDark) {
    this.isDarkMode = isDark
    this.applyTheme()
    this.dispatchThemeChangeEvent()
    this.updateToggleState()
  }

  /**
   * Retorna se está no modo escuro
   */
  isDark() {
    return this.isDarkMode
  }

  /**
   * Retorna se está no modo claro
   */
  isLight() {
    return !this.isDarkMode
  }

  /**
   * Dispara evento de mudança de tema
   */
  dispatchThemeChangeEvent() {
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { isDark: this.isDarkMode } 
    }))
  }

  /**
   * Obtém o ícone apropriado para o botão de tema
   */
  getThemeIcon() {
    return this.isDarkMode ? '☀️' : '🌙'
  }

  /**
   * Obtém o texto apropriado para o botão de tema
   */
  getThemeText(t) {
    return this.isDarkMode ? t('lightMode') : t('darkMode')
  }
} 