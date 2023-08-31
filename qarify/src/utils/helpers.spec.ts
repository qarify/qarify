import { expect } from 'expect-webdriverio';
import type { QADriver, QAFrameworkOption, QARunnerOptions } from '@qarify/types';

import {
  updateConfigWithRunnerOptions, updateExecConfig,
  configVersionToNumber,
  isValidConfigVersion,
} from "./helpers.js";
import { TestReporter } from '../runner/reporter.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';
import { MAX_SUPPORT_VERSION, MIN_SUPPORT_VERSION } from '../constants.js';

describe('utils/helpers', function() {

  it('updateConfigWithRunOptions should update config', async function() {
    const _drivers: QADriver[] = [
      { id: '1', name: '1', protocol: 'http', hostname: '', port: 1, path: '/', capabilities: {} },
      { id: '2', name: '2', protocol: 'http', hostname: '', port: 1, path: '/', capabilities: {} },
    ];
    const config = getDefaultQAConfig('.', { drivers: _drivers });
  
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
    const config = getDefaultQAConfig('.');

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

  it('configVersionToNumber', () => {
    // invalid length
    expect(configVersionToNumber('')).toBe(-1);
    expect(configVersionToNumber('1')).toBe(-1);
    expect(configVersionToNumber('a')).toBe(-1);
    expect(configVersionToNumber('a..')).toBe(-1);
    // invalid value
    expect(configVersionToNumber('1.')).toBe(-2);
    expect(configVersionToNumber('a.')).toBe(-2);
    expect(configVersionToNumber('a.a')).toBe(-2);
    expect(configVersionToNumber('1.a')).toBe(-2);
    expect(configVersionToNumber('a.1')).toBe(-2);
    expect(configVersionToNumber('1.9999999')).toBe(-2);
    // parsed number
    expect(configVersionToNumber('1.0')).toBe(10000);
    expect(configVersionToNumber('1.1')).toBe(10001);
    expect(configVersionToNumber('1.9999')).toBe(19999);
    expect(configVersionToNumber('10.9999')).toBe(109999);
  });

  it('isValidConfigVersion', () => {
    expect(isValidConfigVersion('1.0')).toBe(10000);

    expect(() => isValidConfigVersion('1.')).toThrow(/invalid version/);

    const upperVersion = `${(MAX_SUPPORT_VERSION / 10000).toFixed(0)}.${(MAX_SUPPORT_VERSION % 1000) + 1}`;
    expect(() => isValidConfigVersion(upperVersion)).toThrow(/not supported version/);
    
    const lowerVersion = `${(MIN_SUPPORT_VERSION / 10000).toFixed(0)}.${(MIN_SUPPORT_VERSION % 1000) - 1}`;
    expect(() => isValidConfigVersion(lowerVersion)).toThrow(/not supported version/);
  });
});
