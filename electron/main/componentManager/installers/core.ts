import { Singleton } from '@common/function/singletonDecorator';
import CoreLoader from '@main/coreLoader';
import Storage from '@main/storageManager';
import { getDownloadUrlExtension, getDownloadUrlSuffix } from '@main/utils/os';

import InstallerBase from '../installer';
import type { SourceMirror, UpdateStatus } from '../types';
import { createGetRelease } from '../utils/release';
import { createCheckUpdate } from '../utils/update';

@Singleton
export default class CoreInstaller extends InstallerBase {
  public readonly sources: SourceMirror[] = [
    {
      name: 'GitHub',
      urlReplacer: (oldUrl) => {
        const urlMatches =
          /^https:\/\/(.+)\/MaaAssistantArknights\/MaaRelease\/releases\/download\/(.+)\/(.+)$/.exec(
            oldUrl,
          );
        if (!urlMatches) {
          throw new Error(`Invalid update url: ${oldUrl}`);
        }
        const [, , version, filename] = urlMatches;
        return `https://github.com/MaaAssistantArknights/MaaRelease/releases/download/${version}/${filename}`;
      },
    },
    {
      name: '国内镜像',
      urlReplacer: (oldUrl) => {
        const urlMatches =
          /^https:\/\/(.+)\/MaaAssistantArknights\/MaaRelease\/releases\/download\/(.+)\/(.+)$/.exec(
            oldUrl,
          );
        if (!urlMatches) {
          throw new Error(`Invalid update url: ${oldUrl}`);
        }
        const [, , version, filename] = urlMatches;
        return `https://s3.maa-org.net:25240/maa-release/MaaAssistantArknights/MaaRelease/releases/download/${version}/${filename}`;
      },
    },
    // TODO: Maa R2 Bucket Replacer
    // {
    //   name: 'Maa R2 Bucket',
    //   urlReplacer: oldUrl => {
    //     return oldUrl
    //   }
    // }
  ];
  checkUpdate: () => Promise<UpdateStatus>;

  constructor() {
    super('Maa Core', 'core');
    const storage = new Storage();

    const getRelease = createGetRelease(
      [
        'https://gh.cirno.xyz/api.github.com/repos/MaaAssistantArknights/MaaRelease/releases',
        'https://api.github.com/repos/MaaAssistantArknights/MaaRelease/releases',
      ],
      this.componentType,
    );

    const suffix = getDownloadUrlSuffix();
    const ext = getDownloadUrlExtension();

    this.checkUpdate = createCheckUpdate(
      getRelease,
      {
        OTA: (cur, late) => `MAAComponent-OTA-${cur}_${late}${suffix}${ext}`,
        Full: () => new RegExp(`MAA-v(.+)${suffix}${ext.replaceAll('.', '\\.')}`, 'g'),
      },
      this.componentType,
      this.componentDir,
      () =>
        this.sources.find(
          (s) => s.name === storage.get(['component', this.componentType, 'installMirror']),
        ) || this.sources[0],
    );
  }

  beforeExtractCheck() {
    const version = new CoreLoader().GetCoreVersion();
    return !version;
  }
}
