import { Stack } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

// Scaffold only: Lambda resources will be added after its adapter, assets, and persistence are agreed.
// Account/region are intentionally unspecified so local synthesis does not need an AWS account.
export const createServerStack = (scope: Construct) => {
  return new Stack(scope, 'DaghitServer', {
    description: 'Daghit server infrastructure scaffold; planned deployment target is AWS Lambda.',
    analyticsReporting: false,
  });
};
