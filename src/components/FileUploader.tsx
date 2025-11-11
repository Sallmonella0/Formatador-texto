"use client";
import React, { useState } from "react";
import { uploadFile, downloadFile } from "@/utils/fileUtils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FormatOptions from "./FormatOptions";
import DocumentInfo from "./DocumentInfo";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({ style: "abnt" });
  const [info, setInfo] = useState({
    title: "",
    author: "",
    institution: "",
  });

  const handleUpload = async () => {
    if (!file) return alert("Envie um arquivo .docx primeiro");
    setLoading(true);
    try {
      const blob = await uploadFile(file, { ...options, ...info });
      downloadFile(blob);
    } catch (err) {
      console.error(err);
      alert("Erro ao formatar o documento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-2xl bg-white shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Formatador de Documentos ABNT
      </h1>

      <input
        type="file"
        accept=".docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="p-2 border rounded-md w-full max-w-md"
      />

      <FormatOptions options={options} setOptions={setOptions} />
      <DocumentInfo info={info} setInfo={setInfo} />

      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl mt-3"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Formatar Documento"}
      </Button>
    </div>
  );
}
