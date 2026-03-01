# Configuración de Cloudflare R2

Para que la subida a la nube funcione, crea un archivo `.env` en la raíz de `src-tauri` o en la raíz del proyecto (el backend lo buscará).

```env
# Cloudflare Account ID (disponible en el dashboard de R2)
R2_ACCOUNT_ID=tu_account_id

# Credenciales de API (R2 -> Manage R2 API Tokens)
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_access_key

# Nombre del Bucket
R2_BUCKET_NAME=tu_bucket_name

# URL Pública (opcional, para generar el link final de la imagen)
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Instrucciones de Ejecución

1. Asegúrate de tener instalado [Rust](https://rustup.rs/) y [Node.js](https://nodejs.org/).
2. Instala las dependencias: `npm install`.
3. Ejecuta la aplicación en modo desarrollo: `npm run tauri dev`.
4. Para compilar la versión de producción: `npm run tauri build`.
