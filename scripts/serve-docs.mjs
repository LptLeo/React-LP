/**
 * Servidor local da documentação OpenAPI.
 *
 * Serve os arquivos de `docs/` (ex: `openapi.json` e `index.html` com Swagger
 * UI) usando apenas `node:http` — sem dependências externas — e abre o
 * navegador automaticamente.
 *
 * Uso: `npm run docs:preview` (porta 4174; sobrescreva com PORT=1234).
 *
 * @returns {void}
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { exec } from "node:child_process";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS_ROOT = fileURLToPath(new URL("../docs", import.meta.url));
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT ?? 4174);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
};

/**
 * Abre a URL no navegador padrão do sistema operacional.
 *
 * @param url - URL a ser aberta.
 */
function openBrowser(url) {
  const platform = process.platform;
  const command =
    platform === "darwin"
      ? "open"
      : platform === "win32"
        ? 'cmd /c start ""'
        : "xdg-open";

  const child = exec(
    `${command} "${url}"`,
    { detached: true, stdio: "ignore" },
    (error) => {
      if (error) {
        console.error(`Não foi possível abrir o navegador: ${error.message}`);
      }
    },
  );
  child.unref();
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${HOST}:${PORT}`);
    const pathname =
      requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const filePath = normalize(join(DOCS_ROOT, pathname));

    // Previne path traversal fora da pasta docs/.
    if (!filePath.startsWith(DOCS_ROOT)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type":
        MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.info(`[docs:preview] Documentação disponível em ${url}`);
  openBrowser(url);
});
