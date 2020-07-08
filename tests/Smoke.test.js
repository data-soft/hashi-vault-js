//Simple smoke test

// source process.env
// node Smoke.test.js

const RoleId = process.env.ROLE_ID;
const SecretId = process.env.SECRET_ID;
const ClientCert = process.env.CLIENT_CERT;
const ClientKey = process.env.CLIENT_KEY;
const CACert = process.env.CA_CERT;
const VaultUrl = process.env.VAULT_URL;
const RootPath = process.env.ROOT_PATH;
const AppRole = process.env.APPROLE;
const Metadata = {
  tag1: "development",
  tag2: "smoke-test"
};

const Vault = require('../Vault');
const vault = new Vault( {
    https: true,
    cert: ClientCert,
    key: ClientKey,
    cacert: CACert,
    baseUrl: VaultUrl,
    rootPath: RootPath,
    timeout: 1000,
    proxy: false
});

console.log(".................................\n \n \n");
let token = null;

// Simply check if with the provided role-id and secret-id it is able to:
// 1. Check the status of Vault server
// 2. Login and get an authentication token
// 3. Read the secret-id information
// 4. Generate a new secret-id
// 5. Destroy the generated secret-id
vault.healthCheck().then(function(data) {
  console.log('healthCheck output: \n',data);
  vault.loginWithAppRole(RoleId, SecretId).then(function(data){
    token = data.client_token;
    vault.readAppRoleSecretId(data.client_token, AppRole, SecretId).then(function(data){
      console.log('readAppRoleSecretId output: \n',data);
    }).catch(function(readError){
      console.error('readAppRoleSecretId error: \n',readError);
    });
    vault.generateAppRoleSecretId(token, AppRole, JSON.stringify(Metadata)).then(function(data){
      console.log('generateNewAppRoleSecretId output: \n',data);
      let newSecretId = data.secret_id;
      vault.destroyAppRoleSecretId(token, AppRole, newSecretId).then(function(data) {
        console.log('destroyAppRoleSecretId output: \n',data);
        console.log("\n \n \n.................................\n");
      }).catch(function(destroyError) {
        console.error('destroyAppRoleSecretId error: \n',destroyError);
      });
    }).catch(function(generateError) {
      console.error('generateNewAppRoleSecretId error: \n',generateError);
    });
  }).catch(function(loginError){
    console.error('loginWithAppRole error: \n',loginError);
  });
}).catch(function(healthError){
  console.error('healthCheck error: \n',healthError);
});