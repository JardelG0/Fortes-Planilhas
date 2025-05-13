import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const parseExcel = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  };

  const limparDados = (rows, colData, colNumero, colValor) => {
    const headerIndex = rows.findIndex(r => r.includes(colData) && r.includes(colNumero) && r.includes(colValor));
    const headers = rows[headerIndex];
    const dataRows = rows.slice(headerIndex + 1);

    const iNum = headers.indexOf(colNumero);
    const iData = headers.indexOf(colData);
    const iVal = headers.indexOf(colValor);

    return dataRows
      .filter(r => r[iNum] && r[iData] && r[iVal])
      .map(r => ({
        NUMERO: String(r[iNum]).trim().toUpperCase(),
        DATA_LANCAMENTO: new Date(r[iData]),
        VALOR: parseFloat(String(r[iVal]).replace(/\./g, '').replace(',', '.'))
      }))
      .filter(r => !Object.values(r).includes(NaN));
  };

  const comparar = (d1, d2) => {
    const key = r => `${r.NUMERO}-${r.DATA_LANCAMENTO.toISOString().split('T')[0]}-${r.VALOR.toFixed(2)}`;
    const s1 = new Set(d2.map(key));
    const s2 = new Set(d1.map(key));
    const only1 = d1.filter(r => !s1.has(key(r))).map(r => ({ ...r, ORIGEM: 'Somente na Planilha 1' }));
    const only2 = d2.filter(r => !s2.has(key(r))).map(r => ({ ...r, ORIGEM: 'Somente na Planilha 2' }));
    return [...only1, ...only2];
  };

  const exportar = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Divergencias');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout]), 'divergencias.xlsx');
  };

  const processar = async () => {
    if (!file1 || !file2) return alert('Selecione as duas planilhas!');
    setLoading(true);
    const r1 = await parseExcel(file1);
    const r2 = await parseExcel(file2);
    const d1 = limparDados(r1, 'Emissão', 'Número', 'Valor Contábil');
    const d2 = limparDados(r2, 'Data Lanc.', 'Número', 'Valor');
    const diff = comparar(d1, d2);
    exportar(diff);
    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h1>Comparador de Planilhas</h1>
      <p>Envie duas planilhas .xlsx para comparar.</p>
      <input type='file' accept='.xlsx' onChange={e => handleFileChange(e, setFile1)} />
      <input type='file' accept='.xlsx' onChange={e => handleFileChange(e, setFile2)} />
      <button onClick={processar} disabled={loading}>
        {loading ? 'Processando...' : 'Comparar e Exportar'}
      </button>
    </main>
  );
}