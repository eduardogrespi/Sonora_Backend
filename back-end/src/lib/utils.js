/*
  Função que processa a query string da URL da requisição
  e verifica se o parâmetro "include" foi passado. Em caso
  positivo, preenche um objeto com os relacionamentos que
  devem ser incluídos na consulta sendo executada

  CORREÇÃO: Implementa suporte a aninhamento (dot notation, ex: 'relacao.campo')
*/
function includeRelations(query) {

  // Por padrão, não inclui nenhum relacionamento
  const include = {}

  // Se o parâmetro "include" estiver na query string
  if(query.include) {
    // Recorta o valor do parâmetro, separando os
    // relacionamentos informados onde há vírgula
    const relations = query.include.split(',')

    // Percorre cada relação para construir o objeto de inclusão aninhado
    for(let rel of relations) {
        const parts = rel.split('.');
        let currentLevel = include;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (i === parts.length - 1) {
                // Última parte da relação (o campo real)
                currentLevel[part] = true;
            } else {
                // Parte intermediária (precisa de um objeto 'include' aninhado)
                if (!currentLevel[part]) {
                    // Se o nível não existe, cria como { include: {} }
                    currentLevel[part] = { include: {} };
                }
                // Move para o próximo nível de aninhamento (dentro do 'include')
                currentLevel = currentLevel[part].include;
            }
        }
    }
  }

  return include
}

export { includeRelations }