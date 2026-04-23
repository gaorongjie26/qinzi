import { createServer } from 'http';
import next from 'next';
import type { NextUrlWithParsedQuery } from 'next/dist/server/request-meta';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // 使用新的 URL API 替代 url.parse
      const baseUrl = `http://${hostname}:${port}`;
      const parsedUrl = new URL(req.url!, baseUrl);
      
      // 转换为 Next.js 需要的格式
      const nextParsedUrl: NextUrlWithParsedQuery = {
        pathname: parsedUrl.pathname,
        query: Object.fromEntries(parsedUrl.searchParams),
        search: parsedUrl.search,
        hash: parsedUrl.hash,
        href: parsedUrl.href,
        path: parsedUrl.pathname + parsedUrl.search,
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        auth: parsedUrl.username + (parsedUrl.password ? ':' + parsedUrl.password : ''),
      };
      
      await handle(req, res, nextParsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', err => {
    console.error(err);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});
