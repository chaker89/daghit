# @daghit/infrastructure

TypeScript AWS CDK v2 project for Daghit's infrastructure. The intended server deployment target is AWS Lambda. Database choice and cost requirements will be supplied separately.

## Layout

```text
src/
  app.ts                   CDK application entry point
  stacks/
    server-stack.ts        DaghitServer stack scaffold
cdk.json                   Command CDK uses to launch the compiled app
```

The stack is deliberately empty: there are no Lambda functions, databases, networking resources, or IAM policies yet. The existing Koa server is not Lambda-ready; `server/src/index.ts` starts an HTTP listener and its SQLite database is local. Add a Lambda adapter and approved persistence configuration before wiring the server into this stack. Lambda local disk must not become the durable account/booking database.

## Local checks

From the repository root, run:

```sh
npm run infra:synth
npm run lint --workspace @daghit/infrastructure
npm run typecheck --workspace @daghit/infrastructure
```

`infra:synth` compiles TypeScript to `dist`, then runs the local CDK CLI to generate CloudFormation templates and the assembly in `cdk.out`. It performs no deployment. CDK currently warns that the stack has no resources; this is expected for the scaffold and it is not deployable until resources are defined. The empty stack is environment-agnostic and has no lookups; no AWS account, region, credentials, or bootstrap is required to synthesize it locally.

Lerna discovers this workspace through `projects/*`. Its build participates in affected-project CI and caches both `dist` and `cdk.out`. Generated output is excluded from source inputs and Git. No dependency on the server is declared yet because the scaffold consumes no server asset. When Lambda packaging is implemented, add an explicit server workspace dependency so server changes also affect infrastructure builds.

## Next instructions needed

- AWS account, region, deployment environments, and naming.
- Lambda invocation choice (HTTP API, Function URL, or another entry point), adapter, runtime, packaging, logging retention, and secrets configuration.
- Database access pattern, storage size, durability, expected usage, and budget before choosing the lowest-cost suitable option. Do not provision a database until those requirements are given.
- How the Koa repository module will use the chosen durable database instead of local SQLite.
- Deployment identity and CI permissions. Keep AWS credentials and JWT secrets out of source, templates, and mobile environment variables.

Do not run CDK bootstrap/deploy/destroy as part of local build checks. Those commands change AWS resources and will be configured when deployment is requested.

References: [CDK TypeScript projects](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html), [synthesis](https://docs.aws.amazon.com/cdk/v2/guide/configure-synth.html), and [environment-agnostic stacks](https://docs.aws.amazon.com/cdk/v2/guide/configure-env.html).
