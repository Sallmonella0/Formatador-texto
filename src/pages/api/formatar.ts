import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { formatDocx } from "@/utils/formatDocx";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erro ao processar upload" });

    const file = files.file as formidable.File;
    if (!file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    try {
      const buffer = fs.readFileSync(file.filepath);
      const options = fields.options ? JSON.parse(fields.options as string) : {};
      const { style, title, author, institution } = options;

      const formatted = await formatDocx(buffer, style, { title, author, institution });

      res.setHeader("Content-Disposition", "attachment; filename=formatado.docx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.send(formatted);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Erro ao formatar documento" });
    }
  });
}
