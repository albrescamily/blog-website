# Camily Blog - Blog Minimalista

Um blog moderno e minimalista construído com Vite, Tailwind CSS e JavaScript vanilla, seguindo as melhores práticas do HugoPlate do ZeonStudio. Suporta posts em Markdown, dark mode com toggle deslizante e múltiplos idiomas.

## ✨ Características

- **🎨 Design Moderno**: Interface limpa e responsiva usando Tailwind CSS
- **🌙 Dark Mode**: Toggle deslizante elegante com animações suaves
- **🌍 Múltiplos Idiomas**: Suporte para Português, Inglês e Espanhol
- **📝 Markdown**: Posts escritos em Markdown com renderização segura
- **📱 Responsivo**: Design adaptável para todos os dispositivos
- **⚡ Performance**: Carregamento rápido com Vite
- **🔒 Seguro**: Sanitização de HTML com DOMPurify
- **🏗️ Arquitetura Modular**: Seguindo as práticas do HugoPlate

## 🚀 Tecnologias

- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Marked** - Parser de Markdown
- **DOMPurify** - Sanitização de HTML
- **JavaScript Vanilla** - Sem frameworks pesados

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/blog-website.git
cd blog-website
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

## 🏗️ Estrutura do Projeto (HugoPlate Style)

```
blog-website/
├── index.html                    # Página principal
├── src/
│   ├── main.js                   # Aplicação principal
│   ├── style.css                 # Estilos customizados
│   ├── components/               # Componentes modulares
│   │   ├── Header.js            # Componente do cabeçalho
│   │   ├── Footer.js            # Componente do rodapé
│   │   └── HomePage.js          # Componente da página inicial
│   ├── services/                # Serviços de dados
│   │   └── PostService.js       # Gerenciamento de posts
│   └── utils/                   # Utilitários
│       ├── Translations.js      # Sistema de traduções
│       ├── ThemeManager.js      # Gerenciador de tema
│       └── HeadingExtractor.js  # Extrator de headings
├── posts/
│   ├── posts.json               # Metadados dos posts
│   ├── post-1.md                # Posts em Markdown
│   └── post-2.md
├── tailwind.config.js           # Configuração do Tailwind
├── postcss.config.js            # Configuração do PostCSS
└── package.json                 # Dependências e scripts
```

## 🎯 Arquitetura HugoPlate

### **Componentes Modulares**
- **Header.js**: Cabeçalho com navegação, toggle de tema e seletor de idioma
- **Footer.js**: Rodapé com informações de copyright
- **HomePage.js**: Página inicial com hero section e posts recentes

### **Serviços**
- **PostService.js**: Gerenciamento completo de posts, filtros e busca

### **Utilitários**
- **Translations.js**: Sistema robusto de internacionalização
- **ThemeManager.js**: Gerenciamento avançado de tema com detecção automática
- **HeadingExtractor.js**: Utilitário para extração e gerenciamento de headings markdown

## 🌙 Dark Mode Toggle

O toggle de dark mode foi implementado com:

- **Toggle Deslizante**: Animação suave de deslizar
- **Ícones Dinâmicos**: Sol ☀️ e Lua 🌙 que aparecem/desaparecem
- **Efeitos Visuais**: Hover, active states e brilho animado
- **Detecção Automática**: Baseada na preferência do sistema
- **Persistência**: Configuração salva no localStorage

### Características do Toggle:
```css
.toggle-slider {
  /* Animação suave com cubic-bezier */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-thumb {
  /* Movimento deslizante */
  transform: translateX(0.25rem);
}

.toggle-slider.active .toggle-thumb {
  transform: translateX(1.5rem);
}
```

## 🌍 Sistema de Traduções

Sistema robusto de internacionalização:

```javascript
const translations = new Translations()
translations.setLanguage('pt-BR')
const text = translations.t('welcome')
```

**Idiomas Suportados:**
- 🇧🇷 Português (pt-BR)
- 🇺🇸 Inglês (en)
- 🇪🇸 Espanhol (es)

## 📋 Heading Extractor

Utilitário especializado para extração e gerenciamento de headings markdown:

```javascript
import { HeadingExtractor } from './utils/HeadingExtractor.js'

// Extrair headings
const headings = HeadingExtractor.extractHeadings(content)

// Validar headings
const validHeadings = headings.filter(HeadingExtractor.isValidHeading)

// Filtrar por nível
const h2h3 = HeadingExtractor.filterByLevel(headings, 2, 3)

// Criar hierarquia
const hierarchy = HeadingExtractor.createHierarchy(headings)

// Obter estatísticas
const stats = HeadingExtractor.getStatistics(headings)
```

**Funcionalidades:**
- ✅ Extração automática de headings (h1-h6)
- ✅ Geração de IDs únicos com normalização
- ✅ Validação de headings
- ✅ Filtragem por nível
- ✅ Criação de hierarquia
- ✅ Estatísticas detalhadas
- ✅ Normalização de níveis
- ✅ Validação de estrutura hierárquica

## 📝 Adicionando Posts

1. Crie um arquivo `.md` na pasta `posts/`
2. Adicione os metadados no início do arquivo:
```markdown
---
title: "Título do Post"
date: "2024-01-15"
author: "Seu Nome"
categories: ["Tecnologia", "Programação"]
tags: ["javascript", "web"]
image: "/path/to/image.jpg"
---

Conteúdo do post em Markdown...
```

3. Adicione os metadados ao arquivo `posts/posts.json`:
```json
{
  "id": "post-3",
  "title": "Título do Post",
  "date": "2024-01-15",
  "author": "Seu Nome",
  "categories": ["Tecnologia", "Programação"],
  "tags": ["javascript", "web"],
  "image": "/path/to/image.jpg",
  "filename": "posts/post-3.md"
}
```

## 🎨 Personalização

### Cores e Tema

As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    // ... outras variações
  }
}
```

### Componentes Customizados

Componentes reutilizáveis estão definidos em `src/style.css`:

```css
.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: rgb(147 51 234);
  /* ... outros estilos */
}

.card {
  background-color: white;
  border-radius: 0.75rem;
  /* ... outros estilos */
}
```

## 🔧 Eventos Customizados

A aplicação usa eventos customizados para comunicação entre componentes:

```javascript
// Navegação
window.dispatchEvent(new CustomEvent('navigation', { detail: { view } }))

// Dark mode
window.dispatchEvent(new CustomEvent('darkModeToggle'))

// Mudança de idioma
window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }))
```

## 📱 Responsividade

O design é totalmente responsivo usando classes do Tailwind:

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Grid System**: Grid responsivo para layouts
- **Flexbox**: Layouts flexíveis e adaptáveis

## 🚀 Performance

- **Lazy Loading**: Carregamento sob demanda
- **Code Splitting**: Separação de código por funcionalidade
- **Optimized Assets**: Assets otimizados
- **Minimal Dependencies**: Mínimas dependências externas

## 🔒 Segurança

- **DOMPurify**: Sanitização de HTML para prevenir XSS
- **Content Security Policy**: Políticas de segurança
- **Input Validation**: Validação de entrada
- **Safe Markdown**: Renderização segura de Markdown

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- **ZeonStudio** - Inspiração nas práticas do HugoPlate
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Build tool moderna
- **Marked** - Parser de Markdown

---

**Desenvolvido com ❤️ por Camily** 