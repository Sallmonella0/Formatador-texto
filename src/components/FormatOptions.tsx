import React from "react";

interface Props {
  options: { style: string };
  setOptions: (opts: { style: string }) => void;
}

export default function FormatOptions({ options, setOptions }: Props) {
  return (
    <div className="flex flex-col gap-2 items-start w-full max-w-md">
      <label className="text-gray-700 font-medium">Estilo de formatação:</label>
      <select
        value={options.style}
        onChange={(e) => setOptions({ style: e.target.value })}
        className="border rounded-md p-2 w-full"
      >
        <option value="abnt">ABNT (Brasil)</option>
        <option value="apa">APA (EUA)</option>
        <option value="custom">Personalizado</option>
      </select>
    </div>
  );
}
