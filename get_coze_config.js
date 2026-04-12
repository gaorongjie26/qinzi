
const { Config } = require('coze-coding-dev-sdk');

try {
  const config = new Config();
  console.log('=== coze-coding-dev-sdk Config:');
  console.log('apiKey:', config.apiKey);
  console.log('baseUrl:', config.baseUrl);
  console.log('modelBaseUrl:', config.modelBaseUrl);
  
  console.log('\n=== Environment Variables:');
  console.log('COZE_WORKLOAD_IDENTITY_API_KEY:', process.env.COZE_WORKLOAD_IDENTITY_API_KEY);
  console.log('COZE_INTEGRATION_BASE_URL:', process.env.COZE_INTEGRATION_BASE_URL);
  console.log('COZE_INTEGRATION_MODEL_BASE_URL:', process.env.COZE_INTEGRATION_MODEL_BASE_URL);
} catch (error) {
  console.error('Error:', error);
}

