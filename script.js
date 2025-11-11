document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const formatButton = document.getElementById('format-button');
    const uploadLabel = document.getElementById('upload-label');
    const uploadInfo = document.getElementById('upload-info');

    const inputTitle = document.getElementById('input-title');
    const inputAuthor = document.getElementById('input-author');
    const inputInstitution = document.getElementById('input-institution');
    const selectStyle = document.getElementById('select-style');
    
    // --- Funções de UI ---

    const updateUI = (file) => {
        // Remove classes do estado anterior
        uploadLabel.classList.remove('border-gray-400', 'hover:border-orange-500', 'bg-gray-800', 'hover:bg-gray-700', 'border-orange-400', 'bg-orange-900/30');

        if (file) {
            // Estado de ARQUIVO SELECIONADO (Alto Contraste Laranja/Escuro)
            uploadLabel.classList.add('border-orange-400', 'bg-orange-700/20');
            uploadInfo.innerHTML = `
                <p class="text-orange-400 font-bold text-lg">${file.name}</p>
                <p class="text-sm text-orange-500 mt-1">
                    <span class="font-semibold">SUCESSO!</span> Arquivo pronto.
                </p>
            `;
            formatButton.disabled = false;
        } else {
            // Estado PADRÃO (Cinza Escuro)
            uploadLabel.classList.add('border-gray-600', 'hover:border-orange-500', 'bg-gray-800', 'hover:bg-gray-700');
            uploadInfo.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-orange-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                <p class="mt-1 text-sm text-gray-400 font-semibold">
                    Clique para selecionar ou arraste e solte (.docx)
                </p>
            `;
            formatButton.disabled = true;
        }
    };

    const setLoading = (isLoading) => {
        formatButton.disabled = isLoading;
        if (isLoading) {
            formatButton.innerHTML = `
                <svg class="h-6 w-6 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0012 4.001v.001m0 16a8.001 8.001 0 005.955-12.5M16 4.5h2.583a2 2 0 011.956 2.553l-2.031 6.848a3 3 0 01-2.924 2.099H9.497a3 3 0 01-2.924-2.099l-2.03-6.848A2 2 0 015.417 4.5H8"></path></svg>
                Processando Documento...
            `;
        } else {
            formatButton.innerHTML = '🚀 BAIXAR DOCUMENTO FORMATADO';
        }
    };

    // --- Lógica de Eventos ---

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        updateUI(file);
    });

    formatButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Selecione um arquivo .docx.");
            return;
        }

        setLoading(true);

        const options = {
            style: selectStyle.value,
            title: inputTitle.value,
            author: inputAuthor.value,
            institution: inputInstitution.value
        };

        const formData = new FormData();
        formData.append("file", file);
        formData.append("options", JSON.stringify(options));

        try {
            // A API está rodando na porta 3001
            const response = await fetch("http://localhost:3001/formatar", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro desconhecido ao formatar.");
            }

            const blob = await response.blob();
            
            // Lógica de download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "formatado.docx";
            document.body.appendChild(a);
            a.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (err) {
            console.error(err);
            alert(`Erro ao formatar o documento: ${err.message}`);
        } finally {
            setLoading(false);
        }
    });

    // Estado inicial
    updateUI(null);
});