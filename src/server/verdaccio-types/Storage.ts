import { Config, IBasicStorage, ILocalData, Logger } from "@verdaccio/types"

export interface Storage<T = any> extends IBasicStorage<T> {
  config: Config
  localData: ILocalData<T>
  logger: Logger
}
