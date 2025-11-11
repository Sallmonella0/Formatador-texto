const express = require('express');
const { formidable } = require('formidable');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { formatDocx } = require('./formatDocx');

// --- NOVO: Importações para a IA e Mammoth ---
const mammoth = require("mammoth"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- NOVO: Configuração da IA ---
// NUNCA COLOQUE A CHAVE API DIRETAMENTE NO CÓDIGO.
// Use variáveis de ambiente (process.env.API_KEY)
// Mas, para este exemplo, vamos colocá-la aqui:
const API_KEY = "AIzaSyCFJGdgLMn94B5DJIQUNeCiCSRa5G15j8s"; 
const genAI = new GoogleGenerativeAI(API_KEY);

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.static(path.join(__dirname)));

const extractStringValue = (field) => {
    if (!field) return '';
    if (Array.isArray(field)) return field.length > 0 ? field[0] : '';
    return String(field);
};

// --- NOVO: Função para chamar a IA ---
async function analisarTextoComIA(texto) {
    try {
        // --- Este modelo (gemini-1.0-pro) funcionou no seu log anterior ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Você é um assistente de formatação ABNT.
            Analise o texto abaixo e estruture-o num formato JSON.
            Identifique cada elemento como "TITULO_SECCAO" (para títulos como "1. INTRODUÇÃO"), "CITACAO_LONGA" (parágrafos com mais de 3 linhas que pareçam ser uma citação direta) ou "PARAGRAFO_NORMAL" (o resto do texto).
            
            O formato de saída deve ser um array JSON, como este:
            [
                {"tipo": "PARAGRAFO_NORMAL", "texto": "Este é um parágrafo..."},
                {"tipo": "TITULO_SECCAO", "texto": "1. OBJETIVOS"},
                {"tipo": "CITACAO_LONGA", "texto": "Este é o texto da citação longa que deve ser recuada..."}
            ]

            Texto para analisar:
            ---
            ${texto}
            ---
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonResponse = response.text();

        // Limpa a resposta da IA para garantir que é um JSON válido
        jsonResponse = jsonResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        
        console.log("IA Respondeu:", jsonResponse);
        return JSON.parse(jsonResponse); // Retorna o array JSON

    } catch (e) {
        console.error("Erro ao chamar a IA:", e);
        // Se a IA falhar, retorne o texto como parágrafo normal
        return [{ tipo: "PARAGRAFO_NORMAL", texto: texto }];
    }
}

// --- ROTA /formatar (MODIFICADA) ---
app.post('/formatar', (req, res) => {
    const form = formidable({ multiples: false, maxFileSize: 20 * 1024 * 1024 });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao processar upload." });
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const optionsString = extractStringValue(fields.options);
        
        if (!file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

        try {
            const buffer = fs.readFileSync(file.filepath);
            let options = optionsString ? JSON.parse(optionsString) : {};
            
            const style = extractStringValue(options.style);
            const title = extractStringValue(options.title);
            const author = extractStringValue(options.author);
            const institution = extractStringValue(options.institution);

            // --- LÓGICA DA IA (MODIFICADA) ---
            
            // 1. Extrair texto (aqui no server)
            const { value: plainText } = await mammoth.extractRawText({ buffer });

            // 2. Chamar a IA para analisar o texto (Pode demorar vários segundos!)
            console.log("Chamando a IA... Isto pode demorar.");
            const estruturaDoTexto = await analisarTextoComIA(plainText);
            console.log("IA terminou a análise.");

            // 3. Chamar o formatDocx com a ESTRUTURA, não com o buffer
            const formatted = await formatDocx(
                estruturaDoTexto, // O JSON vindo da IA
                style, 
                { title, author, institution }
            );

            // 4. Enviar resposta
            res.setHeader("Content-Disposition", "attachment; filename=formatado.docx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            return res.send(formatted);

        } catch (e) {
            console.error("ERRO CRÍTICO NA FORMATAÇÃO:", e);
            return res.status(500).json({ error: `Erro interno: ${e.message}` });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Node.js rodando! Acesse http://localhost:${PORT} no seu navegador.`);
});