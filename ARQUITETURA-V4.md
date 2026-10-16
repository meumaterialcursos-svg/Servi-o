# Serviços Perto — Arquitetura V4

## Decisões de produto
- Região piloto: Recife, Pernambuco.
- Público: clientes e profissionais, com áreas separadas; administração como área restrita.
- Plataforma: web responsiva, preparada para evolução a PWA.
- Pagamentos planejados: Pix e cartão por provedor compatível com marketplace.
- Comissão pretendida: 12%, calculada no backend.
- Verificação gradual: novos perfis ficam pendentes e não recebem pedidos até serem aprovados.

## Coleções Firestore sugeridas
- `users/{uid}`: nome, contato, papéis, estado da conta e timestamps.
- `providerProfiles/{uid}`: categorias, descrição, região, portfólio, disponibilidade e estado de verificação.
- `categories/{categoryId}`: nome, slug, subcategorias e ativo.
- `serviceRequests/{requestId}`: clientUid, categoria, título, descrição, fotos, região, endereço privado, data desejada, orçamento e status.
- `proposals/{proposalId}`: requestId, providerUid, valorCentavos, duração, mensagem, validade e status.
- `bookings/{bookingId}`: pedido, proposta aceita, cliente, profissional, valor acordado, comissão, status e agendamento.
- `payments/{paymentId}`: referência do provedor, valor bruto, comissão, valor líquido, estado e reembolso.
- `payouts/{payoutId}`: profissional, contratação, valor, estado e referência de repasse.
- `conversations/{conversationId}/messages/{messageId}`: mensagens e participantes autorizados.
- `reviews/{reviewId}`: contratação, autor, profissional, nota e comentário.
- `disputes/{disputeId}`: contratação, motivo, evidências e estado.
- `regions/{regionId}`: cidade, UF e bairros atendidos.
- `commissionRules/{ruleId}`: percentual, vigência e status.
- `auditLogs/{logId}`: eventos administrativos relevantes.

## Regras financeiras e de segurança
- Valores monetários em centavos inteiros.
- Não guardar dados completos de cartão.
- Criar cobrança e calcular comissão no backend; confirmar pagamentos por webhooks autenticados.
- Usar idempotência para cobranças, confirmações, reembolsos e repasses.
- Proteger endereço, documentos, mensagens e anexos por participantes e permissões.
- Firestore Rules negam por padrão até serem substituídas por regras específicas e testadas.
- Antes do lançamento, revisar termos, privacidade, LGPD, cancelamentos, suporte e requisitos do provedor de pagamento.

## Limites desta entrega
A interface e os arquivos de implantação estão organizados, mas Firebase Authentication, dados compartilhados, propostas remotas, pagamentos Pix/cartão, repasses e verificação online ainda não foram conectados. A comissão de 12% é configuração de negócio, não é cobrada nesta versão.
