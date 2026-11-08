import { App } from 'aws-cdk-lib';
import { createServerStack } from './stacks/server-stack.js';

const app = new App();

createServerStack(app);
app.synth();
