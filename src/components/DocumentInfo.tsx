import React from "react";

interface Props {
  info: { title: string; author: string; institution: string };
  setInfo: (info: { title: string; author: string; institution: string }) => void;
}

export default function DocumentInfo({ info, setInfo }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <label className="font-medium text-gray-700">Informações do Trabalho:</label>

      <input
        type="text"
        placeholder="Título da monografia"
        value={info.title}
        onChange={(e) => setInfo({ ...info, title: e.target.value })}
        className="border rounded-md p-2"
      />

      <input
        type="text"
        placeholder="Autor"
        value={info.author}
        onChange={(e) => setInfo({ ...info, author: e.target.value })}
        className="border rounded-md p-2"
      />

      <input
        type="text"
        placeholder="Instituição"
        value={info.institution}
        onChange={(e) => setInfo({ ...info, institution: e.target.value })}
        className="border rounded-md p-2"
      />
    </div>
  );
}
