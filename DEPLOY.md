GUIA DE DEPLOY — SYNC MARKET

PRÉ-REQUISITOS
- Repositório do projeto acessível pela conta Vercel.
- Projeto Neon com o esquema inicial aplicado.
- String de conexão Neon pooled (hostname com -pooler e TLS/sslmode=require).

VARIÁVEIS DE AMBIENTE NA VERCEL
Obrigatória para a aplicação em produção:
- DATABASE_URL: connection string pooled do Neon. Cadastre como variável sensível nos ambientes Production, Preview e Development conforme necessário. Cole o valor no painel da Vercel, nunca em arquivos commitados, README, chat ou código do navegador.

Opcional, somente para executar o script administrativo de criação do esquema:
- DATABASE_URL_UNPOOLED: connection string direta do Neon. Não é necessária para as requisições normais do site.

PASSOS PELO PAINEL
1. Acesse Vercel e escolha Add New > Project.
2. Importe o repositório deste projeto.
3. Nome do projeto na Vercel: sync-market (o slug técnico usa minúsculas e hífen; a marca visível do site é “Sync Market”).
4. Mantenha o framework Express detectado automaticamente e a raiz do projeto como diretório raiz. Não configure build command nem output directory manualmente.
5. Em Settings > Environment Variables, adicione DATABASE_URL usando a URL pooled do Neon. Marque os ambientes necessários.
6. Faça redeploy após cadastrar ou alterar variáveis.

PASSOS PELO TERMINAL
No diretório raiz do projeto:

  npx vercel login
  npx vercel link --yes --project sync-market
  npx vercel env add DATABASE_URL production
  npx vercel env add DATABASE_URL preview
  npx vercel env add DATABASE_URL development
  npx vercel deploy --prod

O comando env add solicita o valor de forma interativa. Use a URL pooled. Se preferir, cadastre as variáveis no painel e omita esses comandos.

ESQUEMA NEON
Antes de aceitar leads, confirme que o esquema SQL foi aplicado ao banco Neon. Para executar localmente, configure DATABASE_URL_UNPOOLED (preferencial) ou DATABASE_URL em um arquivo .env.local ignorado pelo Git e execute:

  npm run db:init

Esse comando altera o banco criando as tabelas iniciais; revise a conexão selecionada antes de executá-lo. O site em produção não executa migrações automaticamente.

ARQUIVOS VERCEL
O Express é identificado em src/server.js e exportado como aplicação. Os arquivos estáticos ficam em public/ na raiz, formato exigido pela hospedagem da Vercel para servir assets pela CDN. O vercel.json define cabeçalhos básicos de segurança; não são necessárias rewrites neste roteamento.

VERIFICAÇÃO APÓS O DEPLOY
- Abra a URL e confira a página, CSS, JavaScript e o formulário.
- Consulte /api/health e confirme status 200 com database=true.
- Envie um contato de teste e confirme que ele foi salvo no Neon.

