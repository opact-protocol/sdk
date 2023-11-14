/* eslint-disable @typescript-eslint/restrict-template-expressions */
export const getTransactionCode = ({
  proof,
  extData
}: any) => {
  return `(test.opact.transact {
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
  preffix = 'coin',
  withFund = true
) => {
  return `${
    withFund &&
    `(${preffix}.create-account ${JSON.stringify(
      accountName
    )} (read-keyset "${accountName}"))`
  } (${preffix}.coinbase ${JSON.stringify(
    accountName
  )} (read-keyset "${accountName}") 100.0)`
}
