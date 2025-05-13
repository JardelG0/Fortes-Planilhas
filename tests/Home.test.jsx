import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/pages/index.jsx';

test('exibe erro se arquivos não selecionados', () => {
  render(<Home />);
  fireEvent.click(screen.getByText('Comparar e Exportar'));
  expect(screen.getByText('Ambos os arquivos devem ser selecionados')).toBeInTheDocument();
});
