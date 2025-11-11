import { Document, Packer, Paragraph, TextRun, Header, Footer, AlignmentType } from "docx";
import mammoth from "mammoth";

const STYLES = {
  abnt: {
    font: "Times New Roman",
    fontSize: 24, // 12pt
    lineSpacing: 360,
    indent: 720,
    margin: { top: 1440, right: 1134, bottom: 1440, left: 1701 },
  },
  apa: {
    font: "Arial",
    fontSize: 22, // 11pt
    lineSpacing: 240,
    indent: 720,
    margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
  },
  custom: {
    font: "Calibri",
    fontSize: 26,
    lineSpacing: 480,
    indent: 720,
    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
  },
};

export async function formatDocx(
  buffer: Buffer,
  styleKey: string,
  info?: { title?: string; author?: string; institution?: string }
): Promise<Buffer> {
  const style = STYLES[styleKey as keyof typeof STYLES] || STYLES.abnt;
  const { value: plainText } = await mammoth.extractRawText({ buffer });

  const paragraphs = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // CAPA
  const coverPage = [
    new Paragraph({
      text: info?.institution || "",
      alignment: AlignmentType.CENTER,
      spacing: { line: 360 },
      children: [new TextRun({ text: info?.institution || "", bold: true, size: style.fontSize })],
    }),
    new Paragraph({ text: "", spacing: { line: 720 } }),
    new Paragraph({
      text: info?.title || "",
      alignment: AlignmentType.CENTER,
      spacing: { line: 360 },
      children: [
        new TextRun({ text: info?.title || "", bold: true, size: style.fontSize + 2 }),
      ],
    }),
    new Paragraph({ text: "", spacing: { line: 720 } }),
    new Paragraph({
      text: info?.author || "",
      alignment: AlignmentType.CENTER,
      spacing: { line: 360 },
      children: [new TextRun({ text: info?.author || "", size: style.fontSize })],
    }),
  ];

  // CABEÇALHO e RODAPÉ
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: info?.author || "", italics: true, size: 20 })],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: ["Página ", "PAGE"], size: 20 })],
      }),
    ],
  });

  // CONTEÚDO PRINCIPAL
  const body = paragraphs.map(
    (text) =>
      new Paragraph({
        spacing: { line: style.lineSpacing },
        indent: { firstLine: style.indent },
        children: [new TextRun({ text, font: style.font, size: style.fontSize })],
      })
  );

  // DOCUMENTO FINAL
  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: style.margin }, header, footer },
        children: [...coverPage, new Paragraph({ text: "", spacing: { line: 720 } }), ...body],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
