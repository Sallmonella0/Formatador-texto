const express = require('express');
// Importação CORRIGIDA para a versão 3.x do formidable
const { formidable } = require('formidable'); 
const fs = require('fs');
const cors = require('cors');
const { formatDocx } = require('./formatDocx');

const app = express();
const PORT = 3001; 

app.use(cors());

const extractStringValue = (field) => {
    if (!field) return '';
    if (Array.isArray(field)) {
        return field.length > 0 ? field[0] : '';
    }
    return String(field);
};

app.post('/formatar', (req, res) => {
    // Aumenta o limite de arquivo para 20MB
    const form = formidable({ multiples: false, maxFileSize: 20 * 1024 * 1024 }); 

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("ERRO NO UPLOAD (Formidable):", err);
            return res.status(500).json({ error: "Erro ao processar upload do arquivo." });
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const optionsString = extractStringValue(fields.options);
        
        if (!file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

        try {
            // A leitura do arquivo é um ponto de falha comum
            const buffer = fs.readFileSync(file.filepath); 
            
            let options = optionsString ? JSON.parse(optionsString) : {};
            
            const style = extractStringValue(options.style);
            const title = extractStringValue(options.title);
            const author = extractStringValue(options.author);
            const institution = extractStringValue(options.institution);

            // A execução de formatDocx é o ponto mais provável de falha
            const formatted = await formatDocx(buffer, style, { title, author, institution });

            // Resposta de sucesso (deve ser retornada explicitamente)
            res.setHeader("Content-Disposition", "attachment; filename=formatado.docx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            return res.send(formatted);
        } catch (e) {
            // LOG CRÍTICO: Se houver uma falha, ela será capturada e retornada ao frontend
            console.error("ERRO CRÍTICO NA FORMATAÇÃO DOCX:", e);
            return res.status(500).json({ error: `Erro interno do servidor: ${e.message || 'Falha na formatação DOCX.'}` });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando em http://localhost:${PORT}`);
    console.log('Abra o index.html diretamente no seu navegador.');
});