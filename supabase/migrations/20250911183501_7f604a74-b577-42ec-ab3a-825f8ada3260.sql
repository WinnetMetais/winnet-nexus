-- Fix the vw_pendentes_financeiros view to match frontend expectations
DROP VIEW IF EXISTS vw_pendentes_financeiros;

CREATE VIEW vw_pendentes_financeiros AS
SELECT 
  v.id AS venda_id,
  v.valor_total,
  v.status AS venda_status,
  COALESCE(p.status, 'pendente') AS pagamento_status,
  COALESCE(v.forma_pagamento, 'À vista') AS forma_pagamento,
  COALESCE(p.data_pagamento::text, CURRENT_DATE::text) AS data_pagamento,
  COALESCE(lf.status, 'pendente') AS lancamento_status,
  COALESCE(o.numero_orcamento, 'N/A') AS numero_orcamento,
  COALESCE(c.nome, 'Cliente não encontrado') AS cliente_nome,
  v.data_venda::text AS data_venda,
  o.data_vencimento::text AS data_vencimento
FROM vendas v
LEFT JOIN orcamentos o ON v.orcamento_id = o.id
LEFT JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN pagamentos p ON v.id = p.venda_id
LEFT JOIN lancamentos_financeiros lf ON v.id = lf.venda_id AND lf.tipo = 'entrada'
WHERE v.status IN ('pendente') 
   OR p.status IN ('pendente') 
   OR lf.status IN ('pendente')
ORDER BY v.created_at DESC;