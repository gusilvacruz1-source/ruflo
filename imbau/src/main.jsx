import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Hospedadas aqui, não no Google: tira do caminho crítico uma requisição a
// um terceiro e a página passa a ter a voz certa mesmo offline. Os arquivos
// são variáveis — um só cobre todos os pesos, e a serifa traz o eixo óptico,
// que ajusta o contraste das hastes conforme o tamanho.
import '@fontsource-variable/bodoni-moda/opsz.css';
import '@fontsource-variable/archivo/wght.css';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
