# smart-rewarding
Smart rewarding project for [Waves online hackaton](https://forum.wavesplatform.com/t/smart-rewarding/1024)

Actual smart contract:

```javascript
let signature = base58'${currentWallet.keyPair.publicKey}';

match tx { case tx:TransferTransaction =>
    {
        let employerAddress = addressFromPublicKey(tx.senderPk);
        let dateKey = toBase58String(addressFromRecipient(tx.recipient).bytes);
        let salary = extract(getLong(employerAddress, dateKey));

        if((salary == tx.amount) &&
            sigVerify(tx.bodyBytes, tx.proofs[0], signature)) then true else false

    } case _ => false
}
```

[Online demo](https://smart-rewarding.firebaseapp.com/)
