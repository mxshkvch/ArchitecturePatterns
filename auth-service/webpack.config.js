// webpack.config.js (for auth app)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: 'authApp',
      remotes: {
        'client-bank': 'clientBank@http://localhost:3001/remoteEntry.js',
        'staff-service': 'staffService@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^18.0.0' },
        'react-router-dom': { singleton: true },
        axios: { singleton: true },
      },
    }),
  ],
};