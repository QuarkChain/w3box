import { SmartAccount } from '@particle-network/aa';
import { chain } from "@/components/Wallet";
import { ethers } from "ethers";

const project_id = '1dfb2c01-d88d-436a-b7cb-caf8e7bfc931';
const client_key = 'czEvMjfwi6s7dKONW2THRhYSGCl8gu5TUxUxWase';
const app_id = '1be21ef9-fb2e-4642-8fde-b278c88b697b';
const biconomy_api_key = '14QZAXT16.bfe830fc-7672-42db-9614-e4fec87ac902';

export const getAddress = async () => {
    const smartAccount = new SmartAccount(window.ethereum, {
        projectId: project_id,
        clientKey: client_key,
        appId: app_id,
        networkConfig: [
            {dappAPIKey: biconomy_api_key, chainId: chain}
        ],
    });
    console.log(smartAccount, await smartAccount.getAddress())
    return await smartAccount.getAddress();
}

export const queryBalance = async (sessionAddress) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const value = await provider.getBalance(sessionAddress);
    return ethers.utils.formatEther(value);
}

export const transferGas = async (amount, to) => {
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
}
