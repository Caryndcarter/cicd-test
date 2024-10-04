const { Stack, Duration, RemovalPolicy } = require('aws-cdk-lib');
import s3 from "aws-cdk-lib/aws-s3";

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

  }
}

module.exports = { CdkStack }
