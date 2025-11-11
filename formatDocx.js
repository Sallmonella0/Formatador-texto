// --- ESTA É A LINHA QUE CORRIGE O ERRO 'DECIMAL' ---
const { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType, PageNumber, PageNumberFormat, Spacing, Indent } = require("docx");

// --- Definição de Estilos Detalhada ---

// Valores em Twips
const MARGINS_ABNT = { top: 1701, right: 1134, bottom: 1134, left: 1701 };
const MARGINS_APA = { top: 1440, right: 1440, bottom: 1440, left: 1440 };

const STYLES = {
  abnt: {
    // Corpo de texto
    PARAGRAFO_NORMAL: {
      font: "Times New Roman",
      fontSize: 24, // 12pt
      spacing: { line: 360 }, // 1.5
      indent: { firstLine: 720 }, // 1.25cm
    },
    // Título de Secção (Ex: 1. INTRODUÇÃO)
    TITULO_SECCAO: {
      font: "Times New Roman",
      fontSize: 24, // 12pt
      bold: true,
      spacing: { line: 360, before: 240, after: 120 }, // Espaçamento 1.5, com espaço antes/depois
      indent: { firstLine: 0 }, // Sem recuo
    },
    // Citação Longa (Mais de 3 linhas)
    CITACAO_LONGA: {
      font: "Times New Roman",
      fontSize: 20, // 10pt
      spacing: { line: 240 }, // Simples
      indent: { firstLine: 0, left: 2268 }, // Recuo de 4cm (4 * 567)
    }
  },
  apa: {
    // (Poderia definir os estilos APA aqui também)
    PARAGRAFO_NORMAL: { font: "Arial", fontSize: 22, spacing: { line: 480 }, indent: { firstLine: 720 } },
    TITULO_SECCAO: { font: "Arial", fontSize: 22, bold: true, spacing: { line: 480 }, indent: { firstLine: 0 } },
    CITACAO_LONGA: { font: "Arial", fontSize: 22, spacing: { line: 480 }, indent: { firstLine: 0, left: 720 } }, // APA recua o bloco todo
  },
};

// Função auxiliar para criar o parágrafo
function criarParagrafo(item, stylesNorma) {
  // Garante que 'item' e 'item.texto' existem, mesmo que a IA falhe
  if (!item || typeof item.texto !== 'string') {
    return new Paragraph({}); // Retorna um parágrafo vazio se o item for inválido
  }
  
  const estilo = stylesNorma[item.tipo] || stylesNorma.PARAGRAFO_NORMAL;

  return new Paragraph({
    spacing: estilo.spacing,
    indent: estilo.indent,
    children: [
      new TextRun({
        text: item.texto,
        font: estilo.font,
        size: estilo.fontSize,
        bold: estilo.bold || false,
      }),
    ],
  });
}

// --- FUNÇÃO PRINCIPAL (MODIFICADA) ---
exports.formatDocx = async function formatDocx(
  estruturaDoTexto, // Recebe o JSON, não o buffer!
  styleKey,
  info
) {
  const stylesNorma = STYLES[styleKey] || STYLES.abnt;
  const margin = (styleKey === 'abnt') ? MARGINS_ABNT : MARGINS_APA;

  // CAPA (Idêntica a antes)
  const coverPage = [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { line: 360 },
      children: [new TextRun({ text: info?.institution || "", bold: true, size: stylesNorma.PARAGRAFO_NORMAL.fontSize })],
    }),
    new Paragraph({ text: "", spacing: { line: 720 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { line: 360 },
      children: [new TextRun({ text: info?.title || "", bold: true, size: stylesNorma.PARAGRAFO_NORMAL.fontSize + 2 })],
    }),
    new Paragraph({ text: "", spacing: { line: 720 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { line: 360 },
      children: [new TextRun({ text: info?.author || "", size: stylesNorma.PARAGRAFO_NORMAL.fontSize })],
    }),
  ];

  // CABEÇALHO e RODAPÉ (Idênticos a antes, com a correção)
  const header = new Header({
    children: [
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: styleKey === 'abnt' ? "" : (info?.author || ""), italics: true, size: 20 })
      ]}),
    ],
  });
  const footer = new Footer({
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ children: [PageNumber.CURRENT], size: 20 })
      ]}),
    ],
  });

  // --- CONTEÚDO PRINCIPAL (MODIFICADO) ---
  // Mapeia o JSON da IA para Parágrafos do DOCX
  const body = estruturaDoTexto.map(item => criarParagrafo(item, stylesNorma));

  // DOCUMENTO FINAL (Com secções para a capa não ter número)
  const doc = new Document({
    sections: [
      // Secção 1: Capa (Sem rodapé)
      {
        properties: { page: { margin } },
        headers: { default: header },
        footers: { default: new Footer({ children: [] }) },
        children: coverPage,
      },
      // Secção 2: Corpo (Com rodapé)
      {
        properties: { 
          page: { margin },
          // ESTA É A LINHA QUE CAUSA O ERRO (Linha ~129)
          // Ela precisa do PageNumberFormat.DECIMAL
          pageNumber: { start: 2, formatType: PageNumberFormat.DECIMAL }
        },
        headers: { default: header },
        footers: { default: footer },
        children: [new Paragraph({ text: "", spacing: { line: 720 } }), ...body],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};