import { limparDados, comparar } from '../src/pages/index.jsx';

test('limparDados extrai corretamente', () => {
  const rows = [
    ['X', 'A', 'Número', 'Emissão', 'Valor Contábil'],
    ['1', 'unused', '0001', '2025-04-01', '1.000,00']
  ];
  const data = limparDados(rows, 'Emissão', 'Número', 'Valor Contábil');
  expect(data).toEqual([
    { NUMERO: '0001', DATA_LANCAMENTO: new Date('2025-04-01'), VALOR: 1000 }
  ]);
});

test('comparar identifica divergências', () => {
  const a = [{ NUMERO: '1', DATA_LANCAMENTO: new Date('2025-04-01'), VALOR: 10 }];
  const b = [];
  expect(comparar(a, b)).toHaveLength(1);
});
