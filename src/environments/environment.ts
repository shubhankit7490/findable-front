// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  envName: "dev",
  // baseApiPath: 'http://localhost:8081',

  // production: false,
  // envName: 'stag',
  //baseApiPath: 'https://staging-dot-findable-api.appspot.com',
  baseApiPath: "http://104.154.44.66",
  baseUrl: "http://104.154.44.66",
  stripeKey: "pk_test_7JXJfK3INsGQVTnDZfvNKDnS",
};
