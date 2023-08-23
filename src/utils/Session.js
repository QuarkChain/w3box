import { ethers } from "ethers";
import { deriveDriveKey, driveEncrypt, driveDecrypt } from './w3crypto';
import { FileContract } from "./contract";

const stringToHex = (s) => ethers.utils.hexlify(ethers.utils.toUtf8Bytes(s));
const hexToString = (h) => ethers.utils.toUtf8String(h);

export const createWallet = (sessionKey) => {
  const privateKey = Buffer.from(sessionKey, 'base64').toString('hex');
  return new ethers.Wallet(privateKey);
}

function createDriveId(address) {
  return Buffer.from(address)
      .toString('base64')
      .replace('=', '');
}

function createSiweMessage(address, networkId) {
  const domain = window.location.host;
  const uuId = createDriveId(address);
  return `${domain} wants you to sign in with your Ethereum account:
        \n${address}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos
        \n\nURI: https://${domain}\nVersion: 1\nChain ID: ${networkId}\nNonce: ${uuId}`;
}

export const signSeed = async (address, networkId) =>{
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  try {
    const message = createSiweMessage(
        address,
        networkId
    );
    return await signer.signMessage(message);
  } catch (e) {
    return undefined;
  }
}

export const createSession = async (controller, signature, password) => {
  // create key
  const sessionKey = await deriveDriveKey(signature, password);
  const wallet = createWallet(sessionKey);

  // encrypt driveId
  const data = createDriveId(wallet.address);
  const driveEncryptData = await driveEncrypt(sessionKey, data);
  const cipherIV = stringToHex(driveEncryptData.cipherIV);
  const hexData = '0x' + driveEncryptData.data.toString('hex');

  // upload to network
  const fileContract = FileContract(controller);
  const tx = await fileContract.createSession(wallet.address, cipherIV, hexData);
  const receipt = await tx.wait();
  if (receipt.status) {
    return sessionKey;
  }
  return "";
}


export const encryptSession = async (signature, password, iv, encryptData) => {
  // create key
  const driveKey = await deriveDriveKey(signature, password);
  const ivData = ethers.utils.isHexString(iv) ? hexToString(iv) : iv;
  encryptData = encryptData.substr(2, encryptData.length - 1);
  const data = Buffer.from(encryptData, 'hex');
  try {
    await driveDecrypt(driveKey, ivData, data);
    return driveKey;
  } catch (e) {
    return undefined;
  }
}
