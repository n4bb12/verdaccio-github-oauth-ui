import { Config as VerdaccioConfig } from "@verdaccio/types"
import chalk from "chalk"
import { get } from "lodash"

import { pluginName } from "../../constants"
import { logger } from "../../logger"
import { readFileSync, existsSync } from 'fs';

//
// Types
//

export interface PluginConfigBase {
  org?: string
  "client-id"?: string
  "client-secret"?: string
  "enterprise-origin"?: string
}

export interface PluginConfig extends PluginConfigBase {
  "org-file"?: string
  "client-id-file"?: string
  "client-secret-file"?: string
  "enterprise-origin-file"?: string
}

export type PluginConfigBaseKey = keyof PluginConfigBase
export type PluginConfigKey = keyof PluginConfig

export interface Config extends VerdaccioConfig, PluginConfig {
  middlewares: { [pluginName]: PluginConfig }
  auth: { [pluginName]: PluginConfig }
}

//
// Access
//

export function getConfig(config: Config, key: PluginConfigKey): string {
  const value =
    null ||
    get(config, `middlewares[${pluginName}][${key}]`) ||
    get(config, `auth[${pluginName}][${key}]`)

  return process.env[value] || value
}

function setConfig(config: Config, key: PluginConfigKey, section: 'middlewares' | 'auth', value: string): void {
  config[section][pluginName][key] = value;
}

function setConfigFromFile(config: Config, key: PluginConfigBaseKey) {
  const fileKey = `${key}-file` as PluginConfigKey;
  const cfgPath = getConfig(config, fileKey);
  if(typeof cfgPath === 'string'){
    if (!existsSync(cfgPath)) {
      throw new Error(`Invalid path for '${fileKey}'. Please check your verdaccio config.`)
    }
    const value = readFileSync(cfgPath, 'utf8').trim();
    setConfig(config, key, 'auth', value);
    setConfig(config, key, 'middlewares', value);
  }
}

//
// Validation
//

function ensurePropExists(config: Config, key: PluginConfigKey) {
  const value = getConfig(config, key)

  if (!value) {
    logger.error(
      chalk.red(
        `[${pluginName}] ERR: Missing configuration "auth.${pluginName}.${key}"`,
      ),
    )
    throw new Error("Please check your verdaccio config.")
  }
}

function ensureNodeIsNotEmpty(config: Config, node: keyof Config) {
  const path = `[${node}][${pluginName}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginName}" must be enabled`)
  }
}

export function validateConfig(config: Config) {
  setConfigFromFile(config, 'org');
  setConfigFromFile(config, 'client-id');
  setConfigFromFile(config, 'client-secret');
  setConfigFromFile(config, 'enterprise-origin');

  ensureNodeIsNotEmpty(config, "auth")
  ensureNodeIsNotEmpty(config, "middlewares")

  ensurePropExists(config, "org")
  ensurePropExists(config, "client-id")
  ensurePropExists(config, "client-secret")
}
