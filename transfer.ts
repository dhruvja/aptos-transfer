import {AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes} from 'aptos'

// devnet is used here for testing
const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";




(async() => {

    const client = new AptosClient(NODE_URL)
    const faucet = new FaucetClient(NODE_URL, FAUCET_URL)

    const alice = new AptosAccount();
    await faucet.fundAccount(alice.address(), 5000);
    let resources = await client.getAccountResources(alice.address());

    let accountResource = resources.find((r) => r.type == "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>")
    console.log(`Alice Account balance is as follows: ${(accountResource?.data as any).coin.value}`);

    const bob = new AptosAccount();
    await faucet.fundAccount(bob.address(), 0)
    let bobResource = await client.getAccountResources(bob.address());

    let bobAccountResource = bobResource.find((r) => r.type == "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>")
    console.log(`Bob Account balance is as follows ${(bobAccountResource?.data as any).coin.value}`);

    const token = new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString("0x1::aptos_coin::AptosCoin"));

    const scriptFunctionPayload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
        TxnBuilderTypes.ScriptFunction.natural(
            "0x1::coin",
            "transfer",
            [token],
            [BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(bob.address())), BCS.bcsSerializeUint64(100)]
        )
    )

    const rawTxn = await client.generateRawTransaction(alice.address(), scriptFunctionPayload)
    const bcsTxn = AptosClient.generateBCSTransaction(alice, rawTxn)

    const transactionRes = await client.submitSignedBCSTransaction(bcsTxn)

    await client.waitForTransaction(transactionRes.hash)

    
    bobResource = await client.getAccountResources(bob.address());
    bobAccountResource = bobResource.find((r) => r.type == "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>")
    console.log(`Bob Account balance is as follows ${(bobAccountResource?.data as any).coin.value}`);

    let aliceResource = await client.getAccountResources(alice.address());
    let aliceAccountResource = aliceResource.find((r) => r.type == "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>")
    console.log(`Alice Account balance is as follows ${(aliceAccountResource?.data as any).coin.value}`);
})()
