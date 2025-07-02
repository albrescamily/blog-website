/**
 * Footer Component
 * Responsável pela renderização do rodapé da aplicação
 */

export class Footer {
  render(t) {
    const year = new Date().getFullYear()
    const footer = document.createElement('footer')
    footer.className = 'w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16 py-6 text-center text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200'
    
    const wrap = document.createElement('div')
    wrap.className = 'max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2'
    
    const copyright = this.renderCopyright(year, t)
    const madeWith = this.renderMadeWith(t)
    
    wrap.appendChild(copyright)
    wrap.appendChild(madeWith)
    footer.appendChild(wrap)
    
    return footer
  }

  renderCopyright(year, t) {
    const span = document.createElement('span')
    span.innerHTML = `&copy; ${year} Camily Blog. ${t('allRightsReserved')}`
    return span
  }

  renderMadeWith(t) {
    const span = document.createElement('span')
    span.innerHTML = `${t('madeWith')} <span class="text-purple-600 dark:text-purple-400">♥</span> ${t('by')} Camily`
    return span
  }
} 