import { getContractAddress } from "../util"

/* eslint-disable @typescript-eslint/restrict-template-expressions */
export const getTransactionCode = ({
  proof,
  extData
}: any) => {
  return `(test.opact2.transact {
      "public_values":[${proof.public_values.join(' ')}],
      "a":{"x": ${proof.a.x}, "y": ${proof.a.y} },
      "b":{"x":[${proof.b.x.join(
        ' '
      )}],"y":[${proof.b.y.join(' ')}]},
      "c":{"x":${proof.c.x},"y":${proof.c.y}}
    } {
      "sender":"${extData.sender}",
      "recipient":"${extData.recipient}",
      "tokenType": "${extData.tokenType}",
      "tokenAmount":${extData.tokenAmount},
      "tokenId": "${extData.tokenId}",
      "outputCommitments": [${extData.outputCommitments.join(
        ' '
      )}],
      "encryptedReceipts": ["${extData.encryptedReceipts.join(
        '" "'
      )}"],
      "encryptedCommitments": ["${extData.encryptedCommitments.join(
        '" "'
      )}"]
    })`
}

export const getFaucetCode = (
  accountName: string,
  token: any,
  withFund = true
) => {
  const contractAddress = getContractAddress(token)

  return `${
    withFund &&
    `(${contractAddress}.create-account ${JSON.stringify(
      accountName
    )} (read-keyset "${accountName}"))`
  } (${contractAddress}.coinbase ${JSON.stringify(
    accountName
  )} (read-keyset "${accountName}") 100.0)`
}
