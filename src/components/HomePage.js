/**
 * HomePage Component
 * Responsável pela renderização da página inicial
 */

export class HomePage {
  constructor(posts) {
    this.posts = posts
  }

  render(t) {
    const container = document.createElement('div')
    container.className = 'w-full flex flex-col items-center'
    
    const content = document.createElement('div')
    content.className = 'w-full max-w-lg flex flex-col items-center'
    
    const navigation = this.renderNavigation(t)
    const hero = this.renderHero(t)
    const postCollection = this.renderPostCollection(t)
    
    content.appendChild(navigation)
    content.appendChild(hero)
    content.appendChild(postCollection)
    container.appendChild(content)
    
    return container
  }

  renderNavigation(t) {
    const nav = document.createElement('nav')
    nav.className = 'w-full text-gray-500 dark:text-gray-400 text-sm mb-6 flex gap-2 items-center justify-center'
    
    const homeSpan = document.createElement('span')
    homeSpan.className = 'text-gray-900 dark:text-white font-medium'
    homeSpan.textContent = t('home')
    
    const separator = document.createElement('span')
    separator.textContent = '/'
    
    const blogLink = document.createElement('a')
    blogLink.href = '#'
    blogLink.className = 'hover:underline hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200'
    blogLink.textContent = t('blogPosts')
    blogLink.onclick = e => {
      e.preventDefault()
      this.dispatchNavigationEvent('list')
    }
    
    nav.appendChild(homeSpan)
    nav.appendChild(separator)
    nav.appendChild(blogLink)
    
    return nav
  }

  renderHero(t) {
    const hero = document.createElement('div')
    hero.className = 'text-center mb-8'
    
    const title = document.createElement('h1')
    title.className = 'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight'
    title.textContent = t('welcome')
    
    const subtitle = document.createElement('p')
    subtitle.className = 'text-base text-gray-600 dark:text-gray-300 mb-6 max-w-lg leading-relaxed mx-auto text-center'
    subtitle.textContent = t('welcomeSubtitle')
    
    const ctaButton = document.createElement('a')
    ctaButton.href = '#'
    ctaButton.className = 'btn-primary inline-block px-6 py-2 text-base mb-8'
    ctaButton.textContent = t('viewAllPosts')
    ctaButton.onclick = e => {
      e.preventDefault()
      this.dispatchNavigationEvent('list')
    }
    
    hero.appendChild(title)
    hero.appendChild(subtitle)
    hero.appendChild(ctaButton)
    
    return hero
  }

  renderPostCollection(t) {
    const container = document.createElement('div')
    container.className = 'w-full max-w-2xl'
    
    const title = document.createElement('h2')
    title.className = 'text-2xl text-gray-900 dark:text-white font-semibold mb-4'
    title.textContent = t('postCollection')
    
    const postList = document.createElement('ul')
    postList.className = 'space-y-4'
    
    // Mostrar apenas os 3 posts mais recentes
    const recentPosts = this.posts.slice(0, 3)
    
    recentPosts.forEach(post => {
      const postItem = this.renderPostItem(post, t)
      postList.appendChild(postItem)
    })
    
    container.appendChild(title)
    container.appendChild(postList)
    
    return container
  }

  renderPostItem(post, t) {
    const li = document.createElement('li')
    li.className = 'card-home cursor-pointer'
    li.onclick = () => this.dispatchPostViewEvent(post.id)
    
    const title = document.createElement('h3')
    title.className = 'text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200'
    title.textContent = post.title
    
    const meta = document.createElement('div')
    meta.className = 'flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2'
    meta.innerHTML = `<span>${post.date}</span>`
    
    const categories = document.createElement('div')
    categories.className = 'flex flex-wrap gap-2'
    
    if (post.categories && post.categories.length > 0) {
      post.categories.slice(0, 2).forEach(cat => {
        const categoryBtn = document.createElement('button')
        categoryBtn.className = 'btn-tag text-xs'
        categoryBtn.textContent = cat
        categoryBtn.onclick = e => {
          e.stopPropagation()
          this.dispatchCategoryFilterEvent(cat)
        }
        categories.appendChild(categoryBtn)
      })
    }
    
    li.appendChild(title)
    li.appendChild(meta)
    li.appendChild(categories)
    
    return li
  }

  dispatchNavigationEvent(view) {
    window.dispatchEvent(new CustomEvent('navigation', { detail: { view } }))
  }

  dispatchPostViewEvent(postId) {
    window.dispatchEvent(new CustomEvent('postView', { detail: { postId } }))
  }

  dispatchCategoryFilterEvent(category) {
    window.dispatchEvent(new CustomEvent('categoryFilter', { detail: { category } }))
  }
}