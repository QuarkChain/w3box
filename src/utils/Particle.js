import { SmartAccount } from '@particle-network/aa';
import { chain } from "@/components/Wallet";
import { ethers } from "ethers";
import {FileContract} from "@/utils/contract";

const project_id = '1dfb2c01-d88d-436a-b7cb-caf8e7bfc931';
const client_key = 'czEvMjfwi6s7dKONW2THRhYSGCl8gu5TUxUxWase';
const app_id = '1be21ef9-fb2e-4642-8fde-b278c88b697b';
const biconomy_api_key = '14QZAXT16.bfe830fc-7672-42db-9614-e4fec87ac902';

export const getAAAccount = () => {
    return new SmartAccount(window.ethereum, {
        projectId: project_id,
        clientKey: client_key,
        appId: app_id,
        networkConfig: [
            {dappAPIKey: biconomy_api_key, chainId: chain}
        ],
    });
}

export const getAddress = async () => {
    const smartAccount = getAAAccount();
    return await smartAccount.getAddress();
}

export const isCreate = async (contractAddress, account) => {
    const contract = FileContract(contractAddress);
    const aaAccount = await contract.aaMap(account);
    return aaAccount !== '0x0000000000000000000000000000000000000000';
}

export const createAA = async (contractAddress, aaAccount, account) => {
    try {
        const hashedMessage = ethers.utils.keccak256(aaAccount);
        // sign hashed message
        const signature = await window.ethereum.request({
            method: "personal_sign",
            params: [hashedMessage, account],
        });
        const r = signature.slice(0, 66);
        const s = "0x" + signature.slice(66, 130);
        const v = parseInt(signature.slice(130, 132), 16);

        const fileContract = FileContract(contractAddress);
        const populateTx = await fileContract.populateTransaction.setAAAccountByAA(account, v, r, s);
        const tx = {
            to: populateTx.to,
            data: populateTx.data,
        }
        const hash = await sendTx(tx);
        const receipt = await getTxReceipt(hash);
        return receipt.status;
    } catch (e) {
        return undefined;
    }
}

export const queryBalance = async (sessionAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const value = await provider.getBalance(sessionAddress);
    return ethers.utils.formatEther(value);
}

export const transferGas = async (amount, to) => {
    try {
        let transaction = {
            to: to.toLowerCase(),
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther(amount)
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tx = await signer.sendTransaction(transaction);
        const receipt = await tx.wait();
        return receipt.status;
    } catch (e) {
        return false;
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function isTransactionMined(provider, transactionHash) {
    const txReceipt = await provider.getTransactionReceipt(transactionHash);
    if (txReceipt && txReceipt.blockNumber) {
        return txReceipt;
    }
}

export const getTxReceipt = async (transactionHash) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let txReceipt;
    while (!txReceipt) {
        txReceipt = await isTransactionMined(provider, transactionHash);
        if (txReceipt) {
            break;
        }
        await sleep(5000);
    }
    return txReceipt;
}

export const sendTx = async (tx) => {
    const smartAccount = getAAAccount();
    return await sendTxByAccount(smartAccount, tx);
}

export const sendTxByAccount = async (smartAccount, tx) => {
    //get fee quotes with tx or txs
    const feeQuotesResult = await smartAccount.getFeeQuotes(tx);

    // // pay with Native tokens
    // const paidNativeUserOp = feeQuotesResult.verifyingPaymasterNative?.userOp;
    // const paidNativeUserOpHash = feeQuotesResult.verifyingPaymasterNative?.userOpHash;
    // gasless transaction userOp, maybe null
    const gaslessUserOp = feeQuotesResult.verifyingPaymasterGasless?.userOp;
    const gaslessUserOpHash = feeQuotesResult.verifyingPaymasterGasless?.userOpHash;

    const txHash = await smartAccount.sendUserOperation({
        userOp: gaslessUserOp,
        userOpHash: gaslessUserOpHash
    });
    console.log('txHash', txHash);
    return txHash;
}
