const info = require('./package.json');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'packages/common/resources/monster',
    // appBundleId: 'com.maa.maa-x',
    productName: 'electronVben',
    ignore: (filepath) => {
      if (filepath.length === 0) {
        return false;
      }
      if (/^\/dist/.test(filepath)) {
        return false;
      }
      if (/^\/package.json/.test(filepath)) {
        return false;
      }
      if (/^\/node_modules/.test(filepath)) {
        return false;
      }
      return true;
    },
    // asar: true,
  },
  rebuildConfig: {
    buildPath: __dirname,
    extraModules: Object.keys(info.dependencies),
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be
        // Main process, Preload scripts, Worker process, etc.
        build: [
          {
            // `entry` is an alias for `build.lib.entry`
            // in the corresponding file of `config`.
            entry: 'electron/main/index.ts',
            config: 'electron/main/vite.config.ts',
          },
          {
            entry: 'electron/preload/index.ts',
            config: 'electron/preload/vite.config.ts',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: './vite.config.ts',
          },
        ],
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'sima-999', //github-user-name
          name: 'electron-vue-vben-admin', //github-repo-name
        },
      },
    },
  ],
};
