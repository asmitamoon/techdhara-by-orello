// Maps lowercase normalized backend role → frontend URL role param
// Used by: App.jsx (route guards), LoginForm.jsx (post-login redirect), GoogleCallbackPage.jsx (post-OAuth redirect)
export const ROLE_TO_URL = {
  vle: 'vle',
  ao: 'affiliated_organization',
  no: 'nodal_organization',
  innovator: 'innovator',
  general_user: 'general_user',
};
