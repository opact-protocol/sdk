import { expect } from 'chai';
import { getEncryptedReceiptsOfTransaction } from '../receipts';
import { getRandomWallet } from '../../keys';
import { kadenaTokens as kadenaBaseTokens } from '../../constants';
import { decrypt } from '../../encryption';

describe('Receipts tests', () => {
  it('Should create a valid receipts for a Deposit', async () => {
    const receiver = getRandomWallet()

    const sender = 'k:045d640d3abaf87670e2676c094629e29d1665ef6f409fde0247b606ab552131'

    const receipts = getEncryptedReceiptsOfTransaction({
      type: 'deposit',
      amount: 1,
      senderAddress: sender,
      selectedToken: kadenaBaseTokens[0],
      receiverAddress: receiver.address,
    })

    expect(receipts.length).to.equal(1)

    const [
      encrypted
    ] = receipts

    const receipt = decrypt({ encrypted, privateKey: receiver.pvtkey, isUtxo: false })

    expect(receipt.sender).to.equal(sender)
    expect(receipt.type).to.equal('deposit')
    expect(receipt.receiver).to.equal(receiver.address)
    expect(receipt.address).to.equal(kadenaBaseTokens[0].address)
  });

  it('Should create a valid receipts for Withdraw', async () => {
    const sender = getRandomWallet()

    const receiver = 'k:045d640d3abaf87670e2676c094629e29d1665ef6f409fde0247b606ab552131'

    const receipts = getEncryptedReceiptsOfTransaction({
      type: 'withdraw',
      amount: 1,
      receiverAddress: receiver,
      senderAddress: sender.address,
      selectedToken: kadenaBaseTokens[0],
    })

    expect(receipts.length).to.equal(1)

    const [
      encrypted
    ] = receipts

    const receipt = decrypt({ encrypted, privateKey: sender.pvtkey, isUtxo: false })

    expect(receipt.type).to.equal('withdraw')
    expect(receipt.receiver).to.equal(receiver)
    expect(receipt.sender).to.equal(sender.address)
    expect(receipt.address).to.equal(kadenaBaseTokens[0].address)
  });

  it('Should create a valid receipts for Transfer', async () => {
    const sender = getRandomWallet()

    const receiver = getRandomWallet()

    const receipts = getEncryptedReceiptsOfTransaction({
      amount: 1,
      type: 'transfer',
      senderAddress: sender.address,
      receiverAddress: receiver.address,
      selectedToken: kadenaBaseTokens[0],
    })

    expect(receipts.length).to.equal(2)

    const [
      senderEncrypted,
      receiverEncrypted,
    ] = receipts

    const senderReceipt = decrypt({
      isUtxo: false,
      privateKey: sender.pvtkey,
      encrypted: senderEncrypted,
    })

    expect(senderReceipt.type).to.equal('withdraw')
    expect(senderReceipt.sender).to.equal(sender.address)
    expect(senderReceipt.receiver).to.equal(receiver.address)
    expect(senderReceipt.address).to.equal(kadenaBaseTokens[0].address)

    const receiverReceipt = decrypt({
      isUtxo: false,
      privateKey: receiver.pvtkey,
      encrypted: receiverEncrypted,
    })

    expect(receiverReceipt.type).to.equal('deposit')
    expect(receiverReceipt.sender).to.equal(sender.address)
    expect(receiverReceipt.receiver).to.equal(receiver.address)
    expect(receiverReceipt.address).to.equal(kadenaBaseTokens[0].address)
  });
});
