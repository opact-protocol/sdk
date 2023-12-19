import { getConfig } from "../constants";

export const getKeysByChainId = ({
  key,
}: {
  key: string,
}) => {
  const {
    key: configKey
  } = getConfig()

  return {
    utxosKey: `${key}:utxos:${configKey}`,
    indexOfKey: `${key}:indexOf:${configKey}`,
  }
}
