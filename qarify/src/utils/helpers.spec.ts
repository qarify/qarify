import { expect } from 'expect-webdriverio';
import type { QAConfig, QADriver, QAFrameworkOption, QARunnerOptions } from '@qarify/types';
import { SpecRunnerFramework } from '@qarify/types';

import { updateConfigWithRunnerOptions, updateExecConfig } from "./helpers.js";
import { TestReporter } from '../runner/reporter.js';

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
  
    let res = updateConfigWithRunnerOptions(config);
    expect(res).toEqual(config);
    
    // files
    const files = [ './spec.ts' ];
    res = updateConfigWithRunnerOptions(config, files);
    expect(res.specs).toEqual(files);

    // drivers in options
    let options: QARunnerOptions = {
      drivers: ['2'],
    };
    res = updateConfigWithRunnerOptions(config, undefined, options);
    expect(res.drivers).toEqual(_drivers.filter((e) => e.name === '2'));
  });

  it('updateExecConfigWithRunOptions should update config', async function() {
    const config: QAConfig = {
      name: '', rootDir: '.', cacheDir: '.', framework: SpecRunnerFramework.mocha_qunit,
      specs: [], testOptions: {}, drivers: [],
    };

    let res = updateExecConfig(config);
    expect(res).toEqual({ 
      config: { ...config, frameworkOptions: { reporter: undefined, reporterOptions: { isForked: true } } },
      nodeOptions: undefined,
      reporter: undefined,
      qaReporter: undefined,
      options: {},
    });

    let frameworkOptions: QAFrameworkOption = { reporter: 'a' };
    res = updateExecConfig({ ...config, frameworkOptions });
    expect(res).toEqual({ 
      config: { ...config, frameworkOptions: { reporter: 'a', reporterOptions: { isForked: true } } },
      nodeOptions: undefined,
      reporter: undefined,
      qaReporter: undefined,
      options: {},
    });

    frameworkOptions = { reporter: TestReporter };
    res = updateExecConfig({ ...config, frameworkOptions });
    expect(res).toEqual({ 
      config: { ...config, frameworkOptions: { reporter: undefined, reporterOptions: { isForked: true } } },
      nodeOptions: undefined,
      reporter: TestReporter,
      qaReporter: undefined,
      options: {},
    });

    frameworkOptions = { reporterOptions: { qaReporter: {} } };
    res = updateExecConfig({ ...config, frameworkOptions });
    expect(res).toEqual({ 
      config: { ...config, frameworkOptions: { reporter: undefined, reporterOptions: { isForked: true } } },
      nodeOptions: undefined,
      reporter: undefined,
      qaReporter: {},
      options: {},
    });

    // override qaReporter
    frameworkOptions = { reporterOptions: { qaReporter: {} } };
    let options: QARunnerOptions = { execReporter: ['execReporter'] as any, keepMainProcess: true };

    res = updateExecConfig({ ...config, frameworkOptions }, [], options);
    expect(res).toEqual({ 
      config: { ...config, frameworkOptions: { reporter: undefined, reporterOptions: { isForked: true } } },
      nodeOptions: undefined,
      reporter: undefined,
      qaReporter: ['execReporter'],
      options: { keepMainProcess: true },
    });
  });
});
