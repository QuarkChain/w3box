import { deserializeSessionKeyData } from "@zerodevapp/sdk/dist/src/session";
import {
  getRPCProviderOwner,
  getZeroDevSigner,
  createSessionKey,
  createSessionKeySigner
} from "@zerodevapp/sdk";
import { ethers } from "ethers";

export const projectId = '1ca3939f-3e50-4aef-a4bd-7b86eb45ffde';

const sessionKeyTime = 8 * 60 * 60;

const querySessionKey = (owner) => {
  const key = 'session_' + owner;
  const sessionStr = localStorage.getItem(key);
  if (sessionStr) {
    return JSON.parse(sessionStr);
  }
  return undefined;
}

const saveSessionKey = (owner, sessionKeyInfo) => {
  const key = 'session_' + owner;
  localStorage.setItem(key, JSON.stringify(sessionKeyInfo));
}

export const getAASinger = async () => {
  const wallet = getRPCProviderOwner(window.ethereum);
  return await getZeroDevSigner({
    projectId,
    owner: wallet,
  });
}

export const getAAAccount = async () => {
  const signer = await getAASinger();
  const address = await signer.getAddress()
  console.log('My address:', address)
  return address;
}

export const isCreated = async (address) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const bytecode = await provider.getCode(address);
  return bytecode !== '0x';
}

export const createAAAccount = async () => {
  const contractAddress = '0x9cA6feAB8e2d1e61FF9C98420D3B916c5cA846f3'
  const contractABI = [
    'function update() public'
  ]
  const signer = await getAASinger();
  const nftContract = new ethers.Contract(contractAddress, contractABI, signer)
  const tx = await nftContract.update();
  const receipt = await tx.wait();
  console.log(receipt);
  return receipt.status;
}


export const getSessionKey = (owner) => {
  const sessionInfo = querySessionKey(owner);
  if (sessionInfo) {
    return {
      time: Number(sessionInfo.time) * 1000,
      address: sessionInfo.address,
    }
  }
  return undefined;
}

export const getActiveSessionKey = (owner) => {
  const sessionInfo = getSessionKey(owner);
  if (sessionInfo && sessionInfo.time > new Date().getTime()) {
    return sessionInfo;
  }
  return undefined;
}

export const createSessionAccount = async (zeroSigner, contractAddress, owner) => {
  const time = Math.floor(Date.now() / 1000) + sessionKeyTime;
  const sessionKey = await createSessionKey(
      zeroSigner,
      [
        {
          to: contractAddress,
          selectors: [], // all method // nftContract.interface.getSighash('function2'),
        },
      ],
      time
  );

  const SessionKeyData = deserializeSessionKeyData(sessionKey);
  const wallet = new ethers.Wallet(SessionKeyData.sessionPrivateKey);
  const address = await wallet.getAddress();

  await saveSessionKey(owner, {time, address, sessionKey});
  return {
    time: time * 1000,
    address
  }
};

export const createSessionForSmartAccount = async () => {
  const owner = await getEOAAccount();
  const sessionInfo = querySessionKey(owner);
  return await createSessionKeySigner({
    projectId,
    sessionKeyData: sessionInfo.sessionKey
  });
};

export const getEOAAccount = async () => {
  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });
  return accounts[0];
};

export const transferGas = async (receiverAddress, amountInEther) => {
  let transaction = {
    to: receiverAddress,
    // Convert currency unit from ether to wei
    value: ethers.utils.parseEther(amountInEther)
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const tx = await provider.sendTransaction(transaction);
  const receipt = await tx.wait();
  console.log(receipt);
  return receipt.status;
}
