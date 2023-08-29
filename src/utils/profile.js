import { FileContract } from "./contract";
import BigNumber from "bignumber.js";
import {getAAAccount, getTxReceipt, sendTxByAccount} from "@/utils/Particle";

// contract
export const getUploadByAddress = async (controller, address) => {
    const fileContract = FileContract(controller);
    const result = await fileContract.getAuthorFiles(address);
    const files = [];
    const times = result[0];
    const names = result[1];
    const types = result[2];
    const urls = result[3];
    for (let i = 0; i < urls.length; i++) {
        const file = {
            time: new Date(parseInt(times[i], 10) * 1000),
            name: names[i],
            type: types[i],
            url: urls[i],
            showProgress: false
        };
        files.push(file);
    }
    files.sort(function (a, b) {
        return a.time - b.time
    });
    return files;
}

export const deleteFile = async (controller, account, file) => {
    const fileContract = FileContract(controller);
    const tx = await fileContract.populateTransaction.remove(account, file);
    return send(tx);
}

export const deleteFiles = async (controller, account, files) => {
    const fileContract = FileContract(controller);
    const tx = await fileContract.populateTransaction.removes(account, files);
    return send(tx);
}

async function send(tx) {
    const smartAccount = getAAAccount();
    const feeQuotesResult = await smartAccount.getFeeQuotes(tx);
    const balance = feeQuotesResult.verifyingPaymasterNative.feeQuote.balance;
    const cost = feeQuotesResult.verifyingPaymasterNative.feeQuote.fee;
    if(new BigNumber(balance).lt(new BigNumber(cost))){
        // not enough balance
        return 400;
    }

    const hash = await sendTxByAccount(smartAccount, tx);
    console.log(`Transaction Id: ${hash}`);
    const receipt = await getTxReceipt(hash);
    return receipt.status;
}
