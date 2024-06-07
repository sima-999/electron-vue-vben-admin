import CoreInstaller from '@main/componentManager/installers/core';
import CoreLoader from '@main/coreLoader';
import type { Component } from '@type/componentManager';
import fs from 'fs';
import path from 'path';
import Storage from '@main/storageManager';

import { getComponentBaseDir } from '../utils/path';
import { infoPathOf } from '../utils/update';

const storage = new Storage();

export const getComponentCore = async (): Promise<Component> => {
  const coreLoader = new CoreLoader();
  const installer = new CoreInstaller();

  const componentCore: Component = {
    type: 'Maa Core',
    status: 'not-installed',
    installer,
  };

  const installed = fs.existsSync(path.join(getComponentBaseDir(), 'core', 'core_version'));
  if (installed) {
    componentCore.status = 'not-compatible';
  }

  const coreVersion = coreLoader.GetCoreVersion();

  if (coreVersion) {
    componentCore.status = 'installed';
    const ver = infoPathOf(installer.componentDir).currentVersion;
    fs.writeFileSync(ver, coreVersion, 'utf-8'); // always check version
    const update = await installer.checkUpdate();
    if (update.msg === 'haveUpdate') {
      storage.set('setting.version.core.latest', update.update.version);
      componentCore.status = 'upgradable';
    }
  }
  return componentCore;
};
