/* Configuração do Vite, ferramenta que serve e empacota o frontend. */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// O plugin habilita o suporte ao React e a atualização dos componentes durante o desenvolvimento.
export default defineConfig({
  plugins: [react()],
})
