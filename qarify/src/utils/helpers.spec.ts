import { expect } from 'expect-webdriverio';
import { updateConfigWithRunOptions } from "./helpers.js";
import { QAConfig, QADriver, QARunnerOptions } from '../types.js';
import { SpecRunnerFramework } from '../constants.js';

describe('utils/helpers', function() {

  it('updateConfigWithRunOptions should update config', async function() {
    const _drivers: QADriver[] = [
      { id: '1', name: '1', protocol: 'http', hostname: '', port: 1, path: '/', capabilities: {} },
      { id: '2', name: '2', protocol: 'http', hostname: '', port: 1, path: '/', capabilities: {} },
    ];
    const config: QAConfig = {
      name: '', rootDir: '.', cacheDir: '.', framework: SpecRunnerFramework.mocha_qunit,
      specs: [], testOptions: {}, drivers: _drivers,
    };
  
    let res = updateConfigWithRunOptions(config);
    expect(res).toEqual(config);
    
    // files
    const files = [ './spec.ts' ];
    res = updateConfigWithRunOptions(config, files);
    expect(res.specs).toEqual(files);

    // drivers in options
    let options: QARunnerOptions = {
      drivers: ['2'],
    };
    res = updateConfigWithRunOptions(config, undefined, options);
    expect(res.drivers).toEqual(_drivers.filter((e) => e.name === '2'));

    // isForked in options
    options = {
      isForked: true,
    };
    res = updateConfigWithRunOptions(config, undefined, options);
    expect(res.mochaOptions).toEqual({
      reporterOptions: { isForked: true }
    });
  });

});
