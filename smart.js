const WavesAPI = require('./node_modules/@waves/waves-api/dist/waves-api.min.js');
const GitHub = require('./node_modules/github-api/dist/GitHub.bundle.min.js');

    const decimal = 100000000;
    const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);
    const git = new GitHub();
    let balanceCheckTimer;
    let currentWallet;
    function test(){
        alert(Waves.Seed.fromExistingPhrase('garden dress beach push earth ski below notice cry submit parade involve creek special glue'));
    }
    function checkRepository(){
        let profileName = document.getElementById('profileId').value;
        let repositoryName = document.getElementById('repositoryId').value;
        git.getRepo(profileName,repositoryName).getDetails().then(() => {
                showWallet('aa'+ profileName + repositoryName);
            }).catch(e => {
                document.getElementById('errorMessageId').textContent = e;
                document.getElementById('container').style.display = 'none';
            });

    }

    function showWallet(key){
        document.getElementById('errorMessageId').textContent = '';
        currentWallet = Waves.Seed.fromExistingPhrase('garden dress beach push earth ski below notice cry submit parade involve creek special glue');
        displayBalance();
    }

    async function displayBalance(){
        document.getElementById('initRepoId').style.display = 'none';
        balanceCheckTimer = setInterval(startTimerWithInterval, 1000);
    }

    function startTimerWithInterval(){
        Waves.API.Node.addresses.balanceDetails(currentWallet.address).then(balanceDetails => {
            let currentBalance = balanceDetails.available / decimal;
            if(currentBalance > 0.01) {
                clearInterval(balanceCheckTimer);
                addDeveloper();
                addDeveloper();
            }
            document.getElementById('userWalletId').textContent = 'Wallet address - ' + currentWallet.address;
            document.getElementById('userBalanceId').textContent =  'Balance - ' + currentBalance + ' Waves';
            document.getElementById('userSeedId').textContent = 'Seed - ' + currentWallet.phrase;
        }).catch(e => {
            clearInterval(balanceCheckTimer);
            document.getElementById('errorMessageId').textContent = e.message;
            document.getElementById('container').style.display = 'none';
        });;
    }

    let developers = 0;
    function addDeveloper(){

           let container = document.getElementById('container');
           let row = document.createElement('div');

           if(developers === 0){
           let buttonContainer = document.getElementById('buttonCreateSmartContract');
           let button = document.createElement('button');
           button.setAttribute('onclick','createSmartContract()');
           button.innerText = 'Create smart contract';
           buttonContainer.appendChild(button);
           }

           developers++;

           let devName = document.createElement('input');
           devName.setAttribute('size',20);
           devName.setAttribute('type','text');
           devName.setAttribute('placeholder','Developer name');
           devName.setAttribute('id','devName' + developers);
           row.appendChild(devName);
           container.appendChild(row);

           let devWallet = document.createElement('input');
           devWallet.setAttribute('size',20);
           devWallet.setAttribute('type','text');
           devWallet.setAttribute('placeholder','Developer wallet');
           devWallet.setAttribute('id','devWallet' + developers);
           row.appendChild(devWallet);
           container.appendChild(row);

           let buttonAdd = document.createElement('button');
           buttonAdd.setAttribute('onclick','addDeveloper()');
           buttonAdd.innerText = 'add';
           row.appendChild(buttonAdd);
           container.appendChild(row);
    }

    let smart;
    async function createSmartContract(){

        smart = "let chiefPubKey = base58'${currentWallet.keyPair.publicKey}'";
        smart += '\n';
        for(let i = 0; i < developers;i++){
            smart += "let developer" + i + " = extract(addressFromString('" + document.getElementById('devWallet' + i).value + "')).bytes";
        }

        smart += "match tx { case tx:MassTransferTransaction =>";

        for(let i = 0; i<developers; i++){
            smart += "let txRecipient" + i + " = addressFromRecipient(tx.recipient).bytes";
        }

        smart += "if(";
        for(let i = 0; i < developers; i++){
            smart += "(developer" + i + " == txRecipient" + i + ")";
            if(i + 1 < developers){
            smart += ' ||';
            }
        }
        smart += ' && sigVerify(tx.bodyBytes,tx.proofs[0],chiefPubKey)) then true else false';
        smart += 'case _ => true';

        const compiledScript = await Waves.API.Node.utils.script.compile(smart);

        deploySmartContract(compiledScript);
        transferMoney();
    }

    async function deploySmartContract(compiledScript){
        const setScriptObj = Object.assign(Helpers.TX_EXAMPLES.SET_SCRIPT, {
            script: compiledScript,
            sender: currentWallet.address,
            senderPublicKey: currentWallet.keyPair.publicKey
            });
        const setScriptTx = await Waves.tools.createTransaction(Waves.constants.SET_SCRIPT_TX_NAME, setScriptObj);
        setScriptTx.addProof(elephantAccount.keyPair.privateKey);
    }

    async function signTransaction(){
        let currentBalance;
        Waves.API.Node.addresses.balanceDetails(currentWallet.address).then(balanceDetails => {
            currentBalance = balanceDetails.available;
        });

        for(let i = 0;i<developers;i++){
            const transferTxObj = Object.assign(Helpers.TX_EXAMPLES.TRANSFER, {
                recipient: document.getElementById('devWallet' + i).address,
                amount: decimal * 0.01,
                sender: currentWallet.address,
                senderPublicKey: currentWallet.keyPair.publicKey
            });
            const transferTx = await Waves.tools.createTransaction(Waves.constants.TRANSFER_TX_NAME, transferTxObj);
            transferTx.addProof(currentWallet.keyPair.privateKey);
            const transferTxJSON = await transferTx.getJSON();
        }

    }
    function transferMoney(){
        for(let i = 0;i<developers;i++){
            const transferData = {
            recipient: document.getElementById('devWallet' + i).address,
            assetId: 'WAVES',
            amount: decimal * 0.02,
            feeAssetId: 'WAVES',
            fee: decimal * 0.001,
            attachment: '',
            timestamp: Date.now()
        };
        Waves.API.Node.transactions.broadcast('transfer', transferData, currentWallet.keyPair);
        }
    }
