# Encosta Ai

Site institucional da Encosta Ai, empresa de monitoramento geotécnico de encostas e barreiras. A página apresenta a empresa, o serviço, os alertas da Defesa Civil e um mapa para marcar o local de uma vistoria.

É um front-end estático: os dados das áreas são de exemplo e o formulário ainda não envia nada para um servidor.

## Como rodar

É preciso ter o Node.js instalado.

```bash
npm install
npm run dev
```

O Vite mostra o endereço local (em geral `http://127.0.0.1:5173`).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o site em modo de desenvolvimento, com recarga ao salvar |
| `npm run build` | Verifica os tipos TypeScript e gera a pasta `dist` |
| `npm run preview` | Abre localmente o que foi gerado em `dist` |

## Tecnologias

- React 18 e TypeScript
- Vite
- Tailwind CSS 4 (plugin do Vite, sem arquivo de configuração separado)
- react-icons
- Leaflet 1.9.4, carregado pelo CDN do unpkg em `index.html`, com mapas do OpenStreetMap

O Leaflet não está no `package.json`. O tipo mínimo usado no código fica em `src/leaflet.d.ts`.

## Como o site está organizado

A página é uma única tela, com âncoras no menu (`#empresa`, `#atuacao`, `#como`, `#alertas`, `#mapa`, `#duvidas`).

`src/main.tsx` monta o React e importa o CSS. `src/App.tsx` empilha as seções e guarda o estado do modal de vistoria.

| Arquivo | Papel |
| --- | --- |
| `src/components/Header.tsx` | Faixa de emergência, logo e menu. No celular o menu abre pelo ícone |
| `src/components/Hero.tsx` | Título e atalhos do topo |
| `src/components/Indicators.tsx` | Faixa com os quatro números do serviço |
| `src/components/About.tsx` | Texto da empresa, missão, visão e valores |
| `src/components/Services.tsx` | Áreas de atuação |
| `src/components/HowItWorks.tsx` | As quatro etapas do monitoramento |
| `src/components/Alerts.tsx` | Níveis de alerta e exemplos de mensagem da Defesa Civil |
| `src/components/RiskMap.tsx` | Mapa, busca e lista de áreas |
| `src/components/Faq.tsx` | Perguntas frequentes |
| `src/components/Footer.tsx` | Links e contato |
| `src/components/InspectionModal.tsx` | Formulário de solicitação de vistoria |
| `src/data/areas.ts` | Lista de exemplo das áreas (nome, município, tipo, coordenadas) |
| `src/types.ts` | Tipos `Area`, `Risk` e `InspectionPrefill` |
| `src/styles/global.css` | Cores, fontes, botões e a classe `.page` |

As cores e as fontes estão no bloco `@theme` de `src/styles/global.css`. A classe `.page` limita a largura do conteúdo e aplica o espaçamento lateral. Os botões usam `.btn`, `.btn-primary` e `.btn-light`.

## Mapa e formulário

O mapa abre centralizado na região metropolitana do Recife. Um clique no mapa guarda a latitude e a longitude. O botão abaixo abre o formulário já com esses campos preenchidos.

Escolher uma área na lista também abre o formulário, com município, nome do local e coordenadas daquela área. O mapa não desenha os níveis de risco; essa informação aparece só na seção de alertas.

O envio do formulário está em `InspectionModal.tsx`. Hoje ele só escreve os dados no console do navegador. O ponto para ligar uma API está marcado com `TODO` na função `submit`.

## Onde alterar o conteúdo

- Textos das seções: o componente correspondente em `src/components`.
- Áreas do mapa: o array `rows` em `src/data/areas.ts`. Cada linha é nome, município, risco, tipo (`Encosta` ou `Barreira`), latitude, longitude, quantidade de sensores e texto da última leitura.
- Telefone, e-mail e cidade: `src/components/Footer.tsx` e a faixa do `Header.tsx`.
- Logo: `public/logoIcone.png`, usado pelo componente `Logo`.
- Imagem de fundo do topo: `src/assets/heroImage.png`.
