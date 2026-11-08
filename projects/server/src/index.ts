import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createRepository } from './repository.js';

const config = loadConfig();
const repository = createRepository(config.databasePath);
const app = createApp(repository, config, config.origins);
const server = app.listen(config.port, '0.0.0.0', () => console.info(`Daghit API listening on port ${config.port}`));
const shutdown = () => server.close(() => { 
    repository.close(); 
    process.exit(0); 
});
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
