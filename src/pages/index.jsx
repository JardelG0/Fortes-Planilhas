import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button, Spinner, Toggle } from 'shadcn-ui';
import '../global.css';

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0] || null);
    setError('');
  };

  const parseExcel = async (file) => {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  };

  const limparDados = (rows, colData, colNumero, colValor) => {
    const idx = rows.findIndex(r => r.includes(colData) && r.includes(colNumero) && r.includes(colValor));
    if (idx < 0) throw new Error('Cabeçalhos não encontrados');
    const headers = rows[idx];
    return rows.slice(idx + 1)
      .filter(r => r[headers.indexOf(colNumero)] && r[headers.indexOf(colData)] && r[headers.indexOf(colValor)])
      .map(r => ({
        NUMERO: String(r[headers.indexOf(colNumero)]).trim().toUpperCase(),
        DATA_LANCAMENTO: new Date(r[headers.indexOf(colData)]),
        VALOR: parseFloat(String(r[headers.indexOf(colValor)]).replace(/\./g, '').replace(',', '.'))
      }));
  };

  const comparar = (d1, d2) => {
    const key = r => `${r.NUMERO}-${r.DATA_LANCAMENTO.toISOString().split('T')[0]}-${r.VALOR.toFixed(2)}`;
    const set2 = new Set(d2.map(key));
    const set1 = new Set(d1.map(key));
    return [
      ...d1.filter(r => !set2.has(key(r))).map(r => ({ ...r, ORIGEM: 'Planilha 1' })),
      ...d2.filter(r => !set1.has(key(r))).map(r => ({ ...r, ORIGEM: 'Planilha 2' }))
    ];
  };

  const processar = async () => {
    if (!file1 || !file2) {
      setError('Ambos os arquivos devem ser selecionados');
      return;
    }
    try {
      setLoading(true);
      const raw1 = await parseExcel(file1);
      const raw2 = await parseExcel(file2);
      const d1 = limparDados(raw1, 'Emissão', 'Número', 'Valor Contábil');
      const d2 = limparDados(raw2, 'Data Lanc.', 'Número', 'Valor');
      const diff = comparar(d1, d2);
      const ws = XLSX.utils.json_to_sheet(diff);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Divergências');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout]), 'divergencias.xlsx');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <header className="header">
        <h1>Comparador de Planilhas</h1>
        <Toggle checked={darkMode} onChange={setDarkMode} aria-label="Toggle Dark Mode" />
      </header>
      <main className="container">
        <div className="input-group">
          <label>
            Planilha 1:
            <input type="file" accept=".xlsx" onChange={e => handleFileChange(e, setFile1)} />
          </label>
          <label>
            Planilha 2:
            <input type="file" accept=".xlsx" onChange={e => handleFileChange(e, setFile2)} />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <Button onClick={processar} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Comparar e Exportar'}
        </Button>
      </main>
      <footer className="footer">Drag & drop ou selecione os arquivos para iniciar</footer>
    </div>
  );
}
