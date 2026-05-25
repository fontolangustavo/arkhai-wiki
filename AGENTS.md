# Agents Guide - Arkhai Wiki

## Papel do Repositorio

Este repositorio e a wiki publica de Arkhai.
Ele existe para apresentar ao publico apenas informacoes derivadas da fonte interna
`arkhai/`, com foco em itens, sistemas, lore, calculadoras futuras e visualizacao de dados.

## Fonte de Verdade

- A fonte primaria de conteudo e `c:\Users\user\Documents\game\arkhai\`.
- Nao invente regras, atributos, evolucoes ou lore aqui se isso nao estiver consolidado na
  documentacao interna.
- Quando houver divergencia, a wiki deve ser corrigida para refletir a fonte interna, nao o
  contrario.

## Estrutura Atual

- `index.html`, `items.html`, `item.html`, `daggers.html`: paginas publicas do site.
- `docs/`: conteudo editorial e de referencia da wiki.
- `data/`: JSONs usados como fonte de dados para listas, detalhes e simuladores.
- `assets/`: estilos, layout compartilhado e imagens.
- `scripts/`: servidores locais para abrir a wiki via HTTP.

## Regras de Edicao

1. Mantenha links relativos e compatibilidade com GitHub Pages.
2. Nao abra a wiki via `file://`; o site depende de `fetch()` e precisa de HTTP local ou
   publicacao.
3. Se alterar dados em `data/`, verifique se as paginas e os documentos em `docs/`
   continuam sincronizados.
4. Prefira que conteudo exibido ao publico seja derivado de JSON ou de docs publicados,
   nao de texto manual duplicado.
5. Preserve a experiencia de navegacao existente: layout compartilhado, paginas simples e
   informacao consistente entre listagens e detalhes.

## Conteudo Prioritario

- Itens e suas evolucoes.
- Regras de upgrade e ascensao.
- Lore publica condensada.
- Futuras listas de monstros, cidades, classes e sistemas.

## Ao Trabalhar Aqui

- Se surgir uma nova regra de item, primeiro alinhe com `arkhai/` e depois atualize a wiki.
- Se criar uma nova pagina, atualize navegacao, dados e conteudo relacionado no mesmo ciclo.
- Em caso de duvida, favoreca clareza publica e consistencia com a documentacao interna.

