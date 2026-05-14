import path from 'path'

const STORYBOOK_ENV_DEFAULTS = {
  VITE_APP_TITLE: 'Sinan Bolel',
  VITE_CF_DOMAIN: '',
  VITE_USER_POOL_ID: '',
  VITE_USER_POOL_CLIENT_ID: '',
  VITE_AWS_REGION: '',
  VITE_IDP_ENABLED: 'false',
  VITE_COGNITO_DOMAIN: '',
  VITE_COGNITO_REDIRECT_SIGN_IN: '',
  VITE_COGNITO_REDIRECT_SIGN_OUT: '',
  VITE_FIREBASE_API_KEY: '',
  VITE_FIREBASE_AUTH_DOMAIN: '',
  VITE_FIREBASE_PROJECT_ID: '',
  VITE_FIREBASE_STORAGE_BUCKET: '',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '',
  VITE_FIREBASE_APP_ID: '',
  VITE_FIREBASE_DATABASE_URL: '',
  VITE_FIREBASE_MEASUREMENT_ID: '',
  VITE_FIREBASE_FIRESTORE_CHAT: '',
}

for (const [key, value] of Object.entries(STORYBOOK_ENV_DEFAULTS)) {
  process.env[key] ??= value
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  core: {
    disableTelemetry: true,
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // speeds up storybook build time
      allowSyntheticDefaultImports: false,
      // speeds up storybook build time
      esModuleInterop: false,
    },
  },
}

export default config
