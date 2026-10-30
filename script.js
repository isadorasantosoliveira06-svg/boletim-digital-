// --- CONFIGURAÇÃO FIXA DO ALUNO ---
const CONFIG_ALUNO = {
  turma: "8C",
  numeroChamada: 10,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variável para armazenar o PIN em memória durante a sessão
let pinSessao = "";

// Estado para controle de edição
let modoEdicao = false;

// --- DADOS LOCAL DEFAULT DO 8º ANO ---
let dadosDisciplinas = [
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

// --- INSTÂNCIAS DOS GRÁFICOS ---
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// --- FUNÇÃO PARA NORMALIZAR NOTAS ANTIGAS / LOCAIS (0 a 10) ---
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }
  let num = Number(valor);
  if (isNaN(num)) {
    return null;
  }
  if (num > 10 && num <= 100) {
    num = num / 10;
  }
  if (num >= 0 && num <= 10) {
    return num;
  }
  return null;
}

// --- VALIDAÇÃO DA NOTA DIGITADA NA EDIÇÃO ---
function validarNotaEditada(strValor) {
  const v = strValor.trim();
  if (v === "") return { valido: true, valor: null };
  const vNorm = v.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(vNorm)) return { valido: false };
  const num = parseFloat(vNorm);
  if (num >= 0 && num <= 10) {
    return { valido: true, valor: num };
  }
  return { valido: false };
}

// --- VALIDAÇÃO DAS FALTAS DIGITADAS NA EDIÇÃO ---
function validarFaltaEditada(strValor) {
  const v = strValor.trim();
  if (!/^\d+$/.test(v)) return { valido: false };
  const num = parseInt(v, 10);
  if (num >= 0) {
    return { valido: true, valor: num };
  }
  return { valido: false };
}

// --- FUNÇÕES EXCLUSIVAS DE LEITURA E CÁLCULO PARA OS GRÁFICOS ---

function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  const labels = [];
  const dadosMedias = [];

  dadosDisciplinas.forEach(item => {
    labels.push(item.disciplina);
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const notasValidas = [n1, n2, n3].filter(n => n !== null);

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((a, b) => a + b, 0);
      const media = soma / notasValidas.length;
      dadosMedias.push(Number(media.toFixed(1)));
    } else {
      dadosMedias.push(null);
    }
  });

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Média Atual",
        data: dadosMedias,
        backgroundColor: "#6c5ce7",
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          grid: { color: "#eef2f5" }
        },
        y: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Sem nota";
              return ` Média: ${val.toString().replace(".", ",")}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  const notasTri1 = [];
  const notasTri2 = [];
  const notasTri3 = [];

  dadosDisciplinas.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    if (n1 !== null) notasTri1.push(n1);
    if (n2 !== null) notasTri2.push(n2);
    if (n3 !== null) notasTri3.push(n3);
  });

  const m1 = notasTri1.length > 0 ? Number((notasTri1.reduce((a, b) => a + b, 0) / notasTri1.length).toFixed(1)) : null;
  const m2 = notasTri2.length > 0 ? Number((notasTri2.reduce((a, b) => a + b, 0) / notasTri2.length).toFixed(1)) : null;
  const m3 = notasTri3.length > 0 ? Number((notasTri3.reduce((a, b) => a + b, 0) / notasTri3.length).toFixed(1)) : null;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: [m1, m2, m3],
        borderColor: "#fd79a8",
        backgroundColor: "rgba(253, 121, 168, 0.15)",
        borderWidth: 3,
        fill: true,
        tension: 0.2,
        pointBackgroundColor: "#fd79a8",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: { color: "#eef2f5" }
        },
        x: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Sem dados";
              return ` Média: ${val.toString().replace(".", ",")}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas) return;

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  dadosDisciplinas.forEach(item => {
    const f1 = Array.isArray(item.faltas) ? (item.faltas[0] ?? 0) : 0;
    const f2 = Array.isArray(item.faltas) ? (item.faltas[1] ?? 0) : 0;
    const f3 = Array.isArray(item.faltas) ? (item.faltas[2] ?? 0) : 0;

    faltasTri1 += f1;
    faltasTri2 += f2;
    faltasTri3 += f3;
  });

  const totalFaltasAcumuladas = faltasTri1 + faltasTri2 + faltasTri3;
  const LIMITE_REFERENCIA_INTERNA = 350;

  const badgePerigo = document.getElementById("badge-perigo-faltas");
  const cardFaltas = document.getElementById("card-grafico-faltas");

  if (totalFaltasAcumuladas >= LIMITE_REFERENCIA_INTERNA) {
    if (badgePerigo) badgePerigo.style.display = "inline-block";
    if (cardFaltas) cardFaltas.classList.add("grafico-card-critico");
  } else {
    if (badgePerigo) badgePerigo.style.display = "none";
    if (cardFaltas) cardFaltas.classList.remove("grafico-card-critico");
  }

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [faltasTri1, faltasTri2, faltasTri3],
        backgroundColor: "#00b894",
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#eef2f5" }
        },
        x: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.raw} faltas`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// --- FUNÇÃO PARA CONSTRUIR E RENDERIZAR O BOLETIM ---
function construirBoletim() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  
  let somaTodasMedias = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let totalBomDesempenho = 0;
  let totalAtencao = 0;

  tabelaCorpo.innerHTML = "";

  dadosDisciplinas.forEach((item, index) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const f1 = Array.isArray(item.faltas) ? (item.faltas[0] ?? 0) : 0;
    const f2 = Array.isArray(item.faltas) ? (item.faltas[1] ?? 0) : 0;
    const f3 = Array.isArray(item.faltas) ? (item.faltas[2] ?? 0) : 0;

    const totalFaltasDisc = f1 + f2 + f3;
    totalFaltasGeral += totalFaltasDisc;

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

    const tr = document.createElement("tr");

    if (modoEdicao) {
      const valN1 = n1 !== null ? n1.toString().replace(".", ",") : "";
      const valN2 = n2 !== null ? n2.toString().replace(".", ",") : "";
      const valN3 = n3 !== null ? n3.toString().replace(".", ",") : "";

      const tdDisc = document.createElement("td");
      const strongDisc = document.createElement("strong");
      strongDisc.textContent = item.disciplina;
      tdDisc.appendChild(strongDisc);

      const tdN1 = document.createElement("td");
      tdN1.innerHTML = `<input type="text" class="input-edicao" id="edit-n1-${index}" value="${valN1}">`;

      const tdN2 = document.createElement("td");
      tdN2.innerHTML = `<input type="text" class="input-edicao" id="edit-n2-${index}" value="${valN2}">`;

      const tdN3 = document.createElement("td");
      tdN3.innerHTML = `<input type="text" class="input-edicao" id="edit-n3-${index}" value="${valN3}">`;

      const txtMedia = mediaDisc !== null ? mediaDisc.toFixed(1).replace(".", ",") : "—";
      const tdMedia = document.createElement("td");
      tdMedia.innerHTML = `<strong>${txtMedia}</strong>`;

      const tdFaltas = document.createElement("td");
      tdFaltas.innerHTML = `
        <div style="display: flex; gap: 4px;">
          <input type="text" class="input-edicao" id="edit-f1-${index}" value="${f1}" title="Faltas Tri 1">
          <input type="text" class="input-edicao" id="edit-f2-${index}" value="${f2}" title="Faltas Tri 2">
          <input type="text" class="input-edicao" id="edit-f3-${index}" value="${f3}" title="Faltas Tri 3">
        </div>
      `;

      const tdSit = document.createElement("td");
      tdSit.className = classeSituacao;
      tdSit.textContent = situacaoTexto;

      tr.appendChild(tdDisc);
      tr.appendChild(tdN1);
      tr.appendChild(tdN2);
      tr.appendChild(tdN3);
      tr.appendChild(tdMedia);
      tr.appendChild(tdFaltas);
      tr.appendChild(tdSit);
    } else {
      const txtN1 = n1 !== null ? n1.toFixed(1).replace(".", ",") : "—";
      const txtN2 = n2 !== null ? n2.toFixed(1).replace(".", ",") : "—";
      const txtN3 = n3 !== null ? n3.toFixed(1).replace(".", ",") : "—";
      const txtMedia = mediaDisc !== null ? mediaDisc.toFixed(1).replace(".", ",") : "—";

      const tdDisc = document.createElement("td");
      const strongDisc = document.createElement("strong");
      strongDisc.textContent = item.disciplina;
      tdDisc.appendChild(strongDisc);

      const tdN1 = document.createElement("td");
      tdN1.textContent = txtN1;

      const tdN2 = document.createElement("td");
      tdN2.textContent = txtN2;

      const tdN3 = document.createElement("td");
      tdN3.textContent = txtN3;

      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = txtMedia;
      tdMedia.appendChild(strongMedia);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = totalFaltasDisc;

      const tdSit = document.createElement("td");
      tdSit.className = classeSituacao;
      tdSit.textContent = situacaoTexto;

      tr.appendChild(tdDisc);
      tr.appendChild(tdN1);
      tr.appendChild(tdN2);
      tr.appendChild(tdN3);
      tr.appendChild(tdMedia);
      tr.appendChild(tdFaltas);
      tr.appendChild(tdSit);
    }

    tabelaCorpo.appendChild(tr);
  });

  const mediaGeralVal = qtdDisciplinasComMedia > 0 ? (somaTodasMedias / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") : "—";
  
  document.getElementById("card-media").textContent = mediaGeralVal;
  document.getElementById("card-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = totalBomDesempenho;
  document.getElementById("card-atencao").textContent = totalAtencao;

  // Atualização dos gráficos em modo leitura
  atualizarGraficos();
}

// --- PROCESSAR DADOS RECEBIDOS DA API ---
function processarDadosAPI(respostaAPI) {
  if (respostaAPI && respostaAPI.dados && Array.isArray(respostaAPI.dados.disciplinas) && respostaAPI.dados.disciplinas.length > 0) {
    dadosDisciplinas = respostaAPI.dados.disciplinas;
  }
}

// --- FUNÇÃO PARA ABRIR O BOLETIM VIA API ---
async function abrirBoletim() {
  const inputPin = document.getElementById("input-pin");
  const msgPin = document.getElementById("pin-mensagem");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    msgPin.style.color = "#d63031";
    msgPin.textContent = "Por favor, digite o PIN.";
    return;
  }

  msgPin.style.color = "#6c5ce7";
  msgPin.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgPin.style.color = "#d63031";
      msgPin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgPin.style.color = "#d63031";
      msgPin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgPin.style.color = "#d63031";
      msgPin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const data = await resposta.json();

    pinSessao = pinDigitado;
    inputPin.value = "";

    processarDadosAPI(data);

    document.getElementById("area-pin").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    
    construirBoletim();

  } catch (erro) {
    msgPin.style.color = "#d63031";
    msgPin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// --- MODO EDIÇÃO ---
function ativarEdicao() {
  modoEdicao = true;
  document.getElementById("btn-editar").style.display = "none";
  document.getElementById("btn-salvar").style.display = "inline-block";
  document.getElementById("btn-cancelar").style.display = "inline-block";
  document.getElementById("msg-edicao").textContent = "";
  construirBoletim();
}

function cancelarEdicao() {
  modoEdicao = false;
  document.getElementById("btn-editar").style.display = "inline-block";
  document.getElementById("btn-salvar").style.display = "none";
  document.getElementById("btn-cancelar").style.display = "none";
  document.getElementById("msg-edicao").textContent = "";
  construirBoletim();
}

// --- SALVAR ALTERAÇÕES VIA API ---
async function salvarAlteracoes() {
  const msgEdicao = document.getElementById("msg-edicao");
  msgEdicao.style.color = "#2d3436";
  msgEdicao.textContent = "Salvando...";

  let temErro = false;
  const novasDisciplinas = [];

  for (let i = 0; i < dadosDisciplinas.length; i++) {
    const discOriginal = dadosDisciplinas[i];

    const inputN1 = document.getElementById(`edit-n1-${i}`);
    const inputN2 = document.getElementById(`edit-n2-${i}`);
    const inputN3 = document.getElementById(`edit-n3-${i}`);

    const inputF1 = document.getElementById(`edit-f1-${i}`);
    const inputF2 = document.getElementById(`edit-f2-${i}`);
    const inputF3 = document.getElementById(`edit-f3-${i}`);

    [inputN1, inputN2, inputN3, inputF1, inputF2, inputF3].forEach(inp => inp && inp.classList.remove("invalido"));

    const resN1 = validarNotaEditada(inputN1.value);
    const resN2 = validarNotaEditada(inputN2.value);
    const resN3 = validarNotaEditada(inputN3.value);

    const resF1 = validarFaltaEditada(inputF1.value);
    const resF2 = validarFaltaEditada(inputF2.value);
    const resF3 = validarFaltaEditada(inputF3.value);

    if (!resN1.valido) { inputN1.classList.add("invalido"); temErro = true; }
    if (!resN2.valido) { inputN2.classList.add("invalido"); temErro = true; }
    if (!resN3.valido) { inputN3.classList.add("invalido"); temErro = true; }

    if (!resF1.valido) { inputF1.classList.add("invalido"); temErro = true; }
    if (!resF2.valido) { inputF2.classList.add("invalido"); temErro = true; }
    if (!resF3.valido) { inputF3.classList.add("invalido"); temErro = true; }

    if (!temErro) {
      novasDisciplinas.push({
        disciplina: discOriginal.disciplina,
        tri1: resN1.valor,
        tri2: resN2.valor,
        tri3: resN3.valor,
        faltas: [resF1.valor, resF2.valor, resF3.valor]
      });
    }
  }

  if (temErro) {
    msgEdicao.style.color = "#d63031";
    msgEdicao.textContent = "Verifique os campos destacados em vermelho.";
    return;
  }

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.style.color = "#d63031";
      msgEdicao.textContent = "Erro ao salvar alterações. Tente novamente.";
      return;
    }

    dadosDisciplinas = novasDisciplinas;

    modoEdicao = false;
    document.getElementById("btn-editar").style.display = "inline-block";
    document.getElementById("btn-salvar").style.display = "none";
    document.getElementById("btn-cancelar").style.display = "none";

    msgEdicao.style.color = "#00b894";
    msgEdicao.textContent = "Dados salvos com sucesso.";

    construirBoletim();

  } catch (erro) {
    msgEdicao.style.color = "#d63031";
    msgEdicao.textContent = "Não foi possível conectar ao servidor para salvar.";
  }
}

// --- EVENTOS INICIAIS ---
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-entrar").addEventListener("click", abrirBoletim);
  document.getElementById("input-pin").addEventListener("keypress", (e) => {
    if (e.key === "Enter") abrirBoletim();
  });

  document.getElementById("btn-editar").addEventListener("click", ativarEdicao);
  document.getElementById("btn-salvar").addEventListener("click", salvarAlteracoes);
  document.getElementById("btn-cancelar").addEventListener("click", cancelarEdicao);
});