import { expect } from 'expect-webdriverio';
import type { QAConfig, QADriver, QAFrameworkOption, QARunnerOptions, SpecRunnerFramework } from '@qarify/types';

import {
  updateConfigWithRunnerOptions, updateExecConfig,
  validateConfigValues, configVersionToNumber, isValidConfigVersion,
  filterSpecs, shortenNodePath, lengthenNodePath,
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
    const config = getDefaultQAConfig('.', { drivers: [] });
    const runnerId = 'test';
    const options: QARunnerOptions = { runnerId };

    // should set one driver
    let res = updateConfigWithRunnerOptions(config, [], { runnerId });
    expect(res).toEqual({ ...config, runnerId, drivers: [{ name: '_dummy driver_' }] });

    // drivers in config
    config.drivers = _drivers;
    res = updateConfigWithRunnerOptions(config, [], { runnerId });
    expect(res).toEqual({ ...config, runnerId });

    // driver filter in options
    options.drivers = ['2'];
    res = updateConfigWithRunnerOptions(config, [], options);
    expect(res.drivers).toEqual(_drivers.filter((e) => e.name === '2'));

    // files
    const files = [ './spec.ts' ];
    res = updateConfigWithRunnerOptions(config, files, { runnerId });
    expect(res.specs).toEqual(files);
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
    let options: QARunnerOptions = { runnerId: '', execReporter: ['execReporter'] as any, keepMainProcess: true };

    res = updateExecConfig({ ...config, frameworkOptions }, [], options);
    expect(res).toEqual({ 
      config: { ...config, frameworkOptions: { reporter: undefined, reporterOptions: { isForked: true } } },
      nodeOptions: undefined,
      reporter: undefined,
      qaReporter: ['execReporter'],
      options: { runnerId: '', keepMainProcess: true },
    });
  });

  it('validateConfigValues', () => {
    const config = {} as QAConfig;
    expect(() => validateConfigValues(config)).toThrow(/no version/);
    config.version = '1.0';

    expect(() => validateConfigValues(config)).toThrow(/no root directory/);
    config.rootDir = '/';

    expect(() => validateConfigValues(config)).toThrow(/no cache directory/);
    config.cacheDir = '/';

    expect(() => validateConfigValues(config)).toThrow(/no framework/);
    config.framework = 'invalid' as SpecRunnerFramework;
    expect(() => validateConfigValues(config)).toThrow(/invalid framework/);
    config.framework = 'mocha-bdd' as SpecRunnerFramework;

    expect(() => validateConfigValues(config)).toThrow(/no test options/);
    config.testOptions = {};

    config.scriptFramework = {};
    // @ts-ignore
    config.scriptFramework.type = 'invalid';
    expect(() => validateConfigValues(config)).toThrow(/invalid script framework/);
    config.scriptFramework.type = 'qyaction';

    // drivers
    // @ts-ignore
    config.drivers = [ { name: '' } ];
    expect(() => validateConfigValues(config)).toThrow(/invalid driver id/);
    // @ts-ignore
    config.drivers = [ { id: '1' }, { id: '1' } ];
    expect(() => validateConfigValues(config)).toThrow(/duplicated driver id/);

    // @ts-ignore
    config.drivers = [ { id: '1' }, { id: '2' } ];
    expect(validateConfigValues(config)).toBe(true);
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

  it('filterSpecs', () => {
    let spec = ['0.js', '1.ts', '2.android.ts', '3.ios.ts'];
    // no filter
    expect(filterSpecs(spec, undefined)).toEqual(spec);
    expect(filterSpecs(spec, [])).toEqual(spec);
    // ignore js
    expect(filterSpecs(spec, ['*.js'])).toEqual(['1.ts', '2.android.ts', '3.ios.ts']);
    // ignore ts
    expect(filterSpecs(spec, ['*.ts'])).toEqual(['0.js']);
    // ignore android
    expect(filterSpecs(spec, ['*.android.ts'])).toEqual(['0.js', '1.ts', '3.ios.ts']);
  });

  it('shorten/lengthen node path', () => {
    expect(shortenNodePath('')).toBe('');
    expect(shortenNodePath('0')).toBe('0');
    expect(shortenNodePath('0.0')).toBe('0_2');
    expect(shortenNodePath('0.0.0')).toBe('0_3');
    expect(shortenNodePath('0.0.1.2.2.3.4.4.4.4')).toBe('0_2.1.2_2.3.4_4');

    expect(lengthenNodePath('')).toBe('');
    expect(lengthenNodePath('0')).toBe('0');
    expect(lengthenNodePath('0_2')).toBe('0.0');
    expect(lengthenNodePath('0_3')).toBe('0.0.0');
    expect(lengthenNodePath('0_2.1.2_2.3.4_4')).toBe('0.0.1.2.2.3.4.4.4.4');
  });
});
