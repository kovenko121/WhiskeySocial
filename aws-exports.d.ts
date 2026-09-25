interface AWSMobile {
  aws_project_region: string;
  aws_mobile_analytics_app_id: string;
  aws_mobile_analytics_app_region: string;
  Analytics: {
    AWSPinpoint: {
      appId: string;
      region: string;
    };
  };
  aws_appsync_graphqlEndpoint: string;
  aws_appsync_region: string;
  aws_appsync_authenticationType: string;
  aws_appsync_apiKey: string;
  aws_cognito_identity_pool_id: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  oauth: {
    domain: string;
    scope: string[];
    redirectSignIn: string;
    redirectSignOut: string;
    responseType: string;
  };
  federationTarget: string;
  aws_cognito_username_attributes: string[];
  aws_cognito_social_providers: string[];
  aws_cognito_signup_attributes: string[];
  aws_cognito_mfa_configuration: string;
  aws_cognito_mfa_types: string[];
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: number;
    passwordPolicyCharacters: string[];
  };
  aws_cognito_verification_mechanisms: string[];
  aws_user_files_s3_bucket: string;
  aws_user_files_s3_bucket_region: string;
}

declare const awsmobile: AWSMobile;
export default awsmobile;
