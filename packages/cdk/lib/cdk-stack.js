
const { Stack, Duration, RemovalPolicy, CfnOutput, Fn } = require('aws-cdk-lib');
const { Role, PolicyStatement, FederatedPrincipal, Effect } = require('aws-cdk-lib/aws-iam');
const s3 = require("aws-cdk-lib/aws-s3");


class CdkStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);


    const destinationBucket = new s3.Bucket(this, "DestinationBucket", {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      versioned: false,
      websiteErrorDocument: "error.html",
      websiteIndexDocument: "index.html",
    });
    new CfnOutput (this, 'DestinationBucketName', {
      value: destinationBucket.bucketName
    })

// Create an IAM role for GitHub Actions to assume
const bucketDeployRole = new Role(this, "DestinationBucketDeployRole", {
  assumedBy: new FederatedPrincipal(
    Fn.importValue('github-oidc-provider'), //find exported value github-oid-provider & use that here
        {
      StringLike: {
        "token.actions.githubusercontent.com:sub": "repo:caryndcarter/cicd-test:*",
      },
    },
    "sts:AssumeRoleWithWebIdentity", // sts:AssumeRoleWithWebIdentity
  ),
  maxSessionDuration: Duration.hours(1),
});
// Allow the role to write to the bucket
bucketDeployRole.addToPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:ListObjectsV2",
      "s3:PutObject",
    ],
    resources: [`${destinationBucket.bucketArn}/*`],
  }),
);
bucketDeployRole.addToPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["s3:ListBucket"],
    resources: [`${destinationBucket.bucketArn}`],
  }),
);
// Allow the role to read cloudfromation stacks
bucketDeployRole.addToPolicy(
  new PolicyStatement({
    actions: ["cloudformation:DescribeStacks"],
    effect: Effect.ALLOW,
    resources: ["*"], // TODO: restrict to this stack
  }),
);



  }
}

module.exports = { CdkStack }
