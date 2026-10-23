// --- DADOS BRUTOS DO 8º ANO ---
const dadosDisciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// --- FUNÇÃO PARA NORMALIZAR NOTAS (0 a 10) ---
function normalizarNota(valor) {
  // Se for vazio, null ou undefined, retorna null (não lançada)
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string, substitui vírgula por ponto
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  // Converte para número
  let num = Number(valor);

  // Se não for um número válido
  if (isNaN(num)) {
    return null;
  }

  // Regras de conversão
  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  // Retorna o valor se estiver entre 0 e 10
  if (num >= 0 && num <= 10) {
    return num;
  }

  // Caso esteja fora da escala permitida
  return null;
}

// --- FUNÇÃO PARA RENDERIZAR O BOLETIM NO DOM ---
function construirBoletim() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  
  let somaTodasMedias = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let totalBomDesempenho = 0;
  let totalAtencao = 0;

  tabelaCorpo.innerHTML = ""; // Limpa a tabela antes de preencher

  // Passa por cada disciplina do array (forEach)
  dadosDisciplinas.forEach(item => {
    // Normaliza as 3 notas
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Soma as faltas dos 3 trimestres
    const totalFaltasDisc = item.faltas.reduce((a, b) => a + b, 0);
    totalFaltasGeral += totalFaltasDisc;

    // Calcula a média somente com notas válidas
    const notasValidas = [n1, n2, n3].filter(n => n !== null);
    let mediaDisc = null;
    let situacaoTexto = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((a, b) => a + b, 0);
      mediaDisc = soma / notasValidas.length;

      somaTodasMedias += mediaDisc;
      qtdDisciplinasComMedia++;

      if (mediaDisc >= 6.0) {
        situacaoTexto = "Bom desempenho";
        classeSituacao = "situacao-bom";
        totalBomDesempenho++;
      } else {
        situacaoTexto = "Atenção";
        classeSituacao = "situacao-atencao";
        totalAtencao++;
      }
    }

    // Formatação das notas para exibição na tabela
    const txtN1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";
    const txtN2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";
    const txtN3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";
    const txtMedia = mediaDisc !== null ? mediaDisc.toFixed(1).replace(".", ",") : "—";

    // Cria a linha HTML da tabela
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${txtN1}</td>
      <td>${txtN2}</td>
      <td>${txtN3}</td>
      <td><strong>${txtMedia}</strong></td>
      <td>${totalFaltasDisc}</td>
      <td class="${classeSituacao}">${situacaoTexto}</td>
    `;

    tabelaCorpo.appendChild(tr);
  });

  // --- ATUALIZA OS CARDS DE RESUMO ---
  const mediaGeralVal = qtdDisciplinasComMedia > 0 ? (somaTodasMedias / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") : "—";
  
  document.getElementById("card-media").textContent = mediaGeralVal;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = totalBomDesempenho;
  document.getElementById("card-atencao").textContent = totalAtencao;

  // NOTA: A frequência de 92% exibida no HTML é APENAS DEMONSTRATIVA/FICTÍCIA para esta versão inicial.
}

// Executa a função assim que a página carrega
document.addEventListener("DOMContentLoaded", construirBoletim);