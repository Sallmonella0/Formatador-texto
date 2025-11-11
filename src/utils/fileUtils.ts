export async function uploadFile(file: File, options?: any): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  if (options) {
    formData.append("options", JSON.stringify(options));
  }

  const response = await fetch("/api/formatar", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao formatar arquivo.");
  }

  return await response.blob();
}

export function downloadFile(blob: Blob, filename = "formatado.docx") {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
