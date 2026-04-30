# Plano de Correção: Impressão de Recibo Cortada

O problema identificado é que a largura definida para o recibo (`58mm`) é exatamente a largura total do papel das impressoras térmicas comuns. No entanto, essas impressoras possuem margens físicas não imprimíveis (geralmente entre 3mm a 5mm em cada lado). Ao definir a largura como `58mm`, o conteúdo tenta ocupar todo o papel e acaba sendo cortado pelo hardware da impressora.

## Alterações Propostas

### 1. Ajuste de Largura e Margens de Segurança
- Reduzir a largura útil de `58mm` para `52mm` (uma margem de segurança comum para impressoras de 58mm).
- Adicionar um pequeno preenchimento lateral (`padding`) de `2mm`.
- Definir `box-sizing: border-box` para garantir que o padding não aumente a largura total.

### 2. Otimização de Tipografia
- Reduzir levemente a fonte base de `10pt` para `9pt`.
- Ajustar a fonte de destaque (`print-lg`) para evitar que títulos longos (como o nome da loja ou o ID do pedido) estourem a largura.

### 3. Correção da Estrutura de Colunas
- Garantir que as colunas (esquerda/direita) não sofram com `overflow: hidden` que corta o texto.
- Usar um sistema de colunas mais resiliente para impressoras térmicas.

## Arquivos a serem modificados:
- `admin/src/index.css`

## Testes:
- Verificar o layout no modo de visualização de impressão do navegador (Ctrl+P) simulando uma impressora térmica.
