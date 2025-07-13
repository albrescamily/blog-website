# Interface de Grafos - Blog Website

## Visão Geral

A interface de grafos é uma visualização interativa que mostra os relacionamentos entre posts, categorias e tags do blog. Ela foi criada usando D3.js para fornecer uma experiência visual rica e interativa.

## Funcionalidades

### 🎯 Visualização de Relacionamentos
- **Posts** (círculos azuis): Representam os artigos do blog
- **Categorias** (círculos vermelhos): Agrupam posts por tema
- **Tags** (círculos verdes): Marcam características específicas dos posts

### 🔗 Conexões
- **Post → Categoria** (linhas vermelhas): Mostram a qual categoria um post pertence
- **Post → Tag** (linhas verdes): Mostram quais tags um post possui

### 🎮 Interatividade
- **Arrastar**: Mova os nós para reorganizar o grafo
- **Zoom**: Use o scroll do mouse para ampliar/reduzir
- **Hover**: Passe o mouse sobre um nó para destacar suas conexões
- **Clique**: Clique em um nó para ver informações detalhadas

### 🎛️ Controles
- **Filtro por Tipo**: Mostre apenas posts, categorias ou tags
- **Distância dos Links**: Ajuste o espaçamento entre os nós
- **Força de Repulsão**: Controle como os nós se afastam uns dos outros
- **Resetar Visualização**: Volte à visualização inicial
- **Reiniciar Simulação**: Reorganize o grafo automaticamente

## Como Acessar

1. Acesse a página principal do blog
2. Clique no link "Grafos" no cabeçalho
3. A página de grafos abrirá em uma nova aba

## Estrutura dos Arquivos

```
src/
├── components/
│   ├── GraphPage.js      # Componente principal da visualização
│   └── GraphStats.js     # Componente de estatísticas detalhadas
├── services/
│   └── PostService.js    # Serviço para gerenciar dados dos posts
└── utils/
    └── Translations.js   # Traduções da interface

graph.html                # Página HTML da interface de grafos
```

## Tecnologias Utilizadas

- **D3.js**: Biblioteca para visualizações de dados
- **Tailwind CSS**: Framework CSS para estilização
- **JavaScript ES6+**: Linguagem de programação
- **HTML5**: Estrutura da página

## Estatísticas Disponíveis

### Resumo Geral
- Total de posts, categorias, tags e conexões
- Densidade do grafo
- Médias de tags e categorias por post

### Análises Detalhadas
- **Categorias Mais Populares**: Top 5 categorias com mais posts
- **Tags Mais Populares**: Top 5 tags com mais posts
- **Posts com Mais Conexões**: Posts que se conectam com mais elementos
- **Distribuição Temporal**: Análise temporal dos posts

## Personalização

### Cores dos Nós
- Posts: `#3B82F6` (azul)
- Categorias: `#EF4444` (vermelho)
- Tags: `#10B981` (verde)

### Cores das Conexões
- Post → Categoria: `#EF4444` (vermelho)
- Post → Tag: `#10B981` (verde)

### Configurações da Simulação
- Distância padrão dos links: 100px
- Força de repulsão padrão: -300
- Escala de zoom: 0.1x a 4x

## Dependências

```json
{
  "dependencies": {
    "d3": "^7.0.0"
  }
}
```

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse `http://localhost:5173/graph.html`

## Exemplos de Uso

### Explorando Relacionamentos
1. Abra a interface de grafos
2. Passe o mouse sobre um post para ver suas categorias e tags
3. Clique em uma categoria para ver todos os posts relacionados
4. Use os filtros para focar em tipos específicos de elementos

### Análise de Dados
1. Observe as estatísticas detalhadas na parte inferior
2. Identifique categorias e tags mais populares
3. Analise a distribuição temporal dos posts
4. Calcule a densidade do grafo para entender a conectividade

## Contribuição

Para adicionar novos posts ao grafo:

1. Adicione o post em `posts/post-X.md`
2. Atualize `posts/posts.json` com as informações do post
3. Inclua categorias e tags apropriadas
4. A interface de grafos será atualizada automaticamente

## Limitações

- A visualização funciona melhor com até 50-100 nós
- Performance pode ser afetada com muitos posts
- Requer navegador moderno com suporte a ES6+

## Próximas Melhorias

- [ ] Filtros avançados por data
- [ ] Exportação da visualização
- [ ] Animações de transição
- [ ] Modo de apresentação
- [ ] Integração com APIs externas
- [ ] Visualizações alternativas (árvore, matriz)

## Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador para erros
2. Certifique-se de que todas as dependências estão instaladas
3. Confirme que os arquivos de posts estão no formato correto 