import fastify from 'fastify';
import { app } from './app.js';
import { join } from 'node:path';
import { createReadStream } from 'node:fs';
import fstatic from '@fastify/static';

const defaults = {
  port: 4321,
};

export const createServer = () => {
  const server = fastify();
  app.server = server;

  server.register(fstatic, {
    wildcard: false,
    root: join(app.sourceDirectory, 'www/dist'),
  });

  server.get('/*', (req, res) => {
    res.send(createReadStream(join(app.sourceDirectory, 'www/index.html')));
  });

  /**
   * @params {number} port
   */
  return async (port) => {
    const _port = port || defaults.port;
    await server.listen({
      port: _port,
    });
    process.stdout.write(`Listening on http://localhost:${_port}`);
  };
};
