// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  base_Url: 'http://localhost:4200',
  env: 'netgear',
  envName: 'Netgear',
 // user_Api: 'https://bii62i1ojf.execute-api.us-west-2.amazonaws.com/Dev',
  //user_Api: 'http://localhost:58360',
  user_Api: 'http://34.219.170.117:9096',
  //download_Api: 'https://4e2k3m1ltg.execute-api.us-west-2.amazonaws.com/Dev/api/document',
  download_Api: 'http://34.219.170.117:9095/api/document',
  //transcription_Api: 'https://80v3982yng.execute-api.us-west-2.amazonaws.com/Dev',
  //transcription_Api: 'http://localhost:4840',
  transcription_Api : 'http://34.219.170.117:9094',
  transcriptiondownloader_Api: 'http://34.219.170.117:9095'
};
