# Serviços Perto V4 — Recife/PE

Marketplace de serviços a domicílio organizado em HTML, CSS e JavaScript.

## Configuração inicial
- Região: Recife/PE (piloto).
- Público: clientes e profissionais.
- Pagamento planejado: Pix e cartão.
- Comissão planejada: 12%.
- Verificação profissional: gradual.
- Interface web responsiva com preparação PWA.

## Arquivos
- `index.html`: estrutura de interface.
- `css/style.css`: estilos.
- `js/app.js`: interações atuais do protótipo.
- `manifest.webmanifest` e `sw.js`: suporte progressivo PWA.
- `config/launch-config.json`: escolhas de produto.
- `firebase.json`, `firestore.rules`, `firestore.indexes.json`: configuração inicial Firebase.
- `js/firebase-config.example.js`: modelo de configuração.
- `docs/ARQUITETURA-V4.md`: arquitetura e modelo de dados.

## Teste
Abra `index.html` para testar a interface. Para validar PWA/service worker, use HTTPS ou servidor local.

## GitHub Pages
Envie o conteúdo desta pasta para a raiz do repositório e ative Pages na branch principal. O GitHub Pages hospeda a interface estática; autenticação e dados compartilhados dependem do Firebase/backend.

## Próxima implementação
1. Firebase Authentication.
2. Firestore com regras por papel e propriedade.
3. Pedidos e propostas compartilhados.
4. Mensagens e agenda.
5. Provedor de pagamento compatível com marketplace.
6. Comissões, webhooks, reembolsos e repasses.

Não use com dados reais antes de concluir autenticação, regras de segurança, testes e revisão legal. A cobrança real não está ativada nesta versão.


## Evolução 4.1 — ações locais
- Validação de data para impedir datas passadas e validação mínima do local.
- Ações de pedido mais seguras: o cliente pode cancelar pedidos abertos, mas não alterar livremente o estado operacional.
- Perfil profissional começa como **pendente de análise**; a interface não declara que está aprovado.
- Exportação e importação de backup JSON dos pedidos armazenados no dispositivo.
- Estados de fluxo mais explícitos para pedidos e perfis.

**Limite importante:** estas ações continuam no armazenamento local do navegador. O backup é manual. A importação valida o formato básico, mas não substitui uma base de dados. Autenticação, sincronização entre dispositivos, propostas reais, aprovação administrativa, pagamentos Pix/cartão e comissão de 12% ainda dependem de backend e integrações reais.
