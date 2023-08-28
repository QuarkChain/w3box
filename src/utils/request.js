import { ethers } from "ethers";
import {queryBalance} from "@/utils/Particle";
import {FileContract} from "@/utils/contract";
const sha3 = require('js-sha3').keccak_256;

const stringToHex = (s) => ethers.utils.hexlify(ethers.utils.toUtf8Bytes(s));

const readFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(Buffer.from(res.target.result));
    };
    reader.readAsArrayBuffer(file);
  });
}

const bufferChunk = (buffer, chunkSize) => {
  let i = 0;
  let result = [];
  const len = buffer.length;
  const chunkLength = Math.ceil(len / chunkSize);
  while (i < len) {
    result.push(buffer.slice(i, i += chunkLength));
  }
  return result;
}

const clearOldFile = async (fileContract, chunkSize, hexName) => {
  try {
    const oldChunkSize = await fileContract.countChunks(hexName);
    if (oldChunkSize > chunkSize) {
      // remove
      const tx = await fileContract.remove(hexName);
      console.log(`Remove file: ${hexName}`);
      console.log(`Transaction Id: ${tx.hash}`);
      const receipt = await tx.wait();
      return receipt.status;
    }
  } catch (e) {
    return false;
  }
  return true;
}

export const request = async ({
  chunkLength,
  account,
  contractAddress,
  dirPath,
  file,
  onSuccess,
  onError,
  onProgress
}) => {
  const rawFile = file.raw;
  const content = await readFile(rawFile);
  // file name
  const name = dirPath + rawFile.name;
  const hexName = stringToHex(name);
  const hexType = stringToHex(rawFile.type);
  const fileSize = rawFile.size;
  // Data need to be sliced if file > 475K
  let chunks = [];
  if (fileSize > chunkLength) {
    const chunkSize = Math.ceil(fileSize / chunkLength);
    chunks = bufferChunk(content, chunkSize);
  } else {
    chunks.push(content);
  }

  const fileContract = await FileContract(contractAddress);
  const clear = await clearOldFile(fileContract, chunks.length, hexName, hexType)
  if (!clear) {
    onError(new Error("Check Old File Fail!"));
    return;
  }

  let uploadState = true;
  let notEnoughBalance = false;
  for (const index in chunks) {
    const chunk = chunks[index];
    const hexData = '0x' + chunk.toString('hex');
    const localHash = '0x' + sha3(chunk);
    const hash = await fileContract.getChunkHash(hexName, index);
    if (localHash === hash) {
      console.log(`File ${name} chunkId: ${index}: The data is not changed.`);
      onProgress({ percent: Number(index) + 1});
      continue;
    }

    try {
      const balance = await queryBalance(account);
      // if(balance.lte(ethers.utils.parseEther(cost.toString()))){
      if(balance.lte(ethers.utils.parseEther(1))){
        // not enough balance
        uploadState = false;
        notEnoughBalance = true;
        break;
      }

      // file is remove or change
      console.log(hexName, hexType, index);
      const tx = await fileContract.writeChunk(hexName, hexType, index, hexData);
      console.log(`Transaction Id: ${tx.hash}`);
      const receipt = await tx.wait();
      if (!receipt.status) {
        uploadState = false;
        break;
      }
      onProgress({ percent: Number(index) + 1});
    } catch (e) {
      console.log(e)
      uploadState = false;
      break;
    }
  }
  if (uploadState) {
    const url = "https://file.w3q.arb-goerli.w3link.io/" + account + "/" + name;
    onSuccess({ path: url});
  } else {
    if (notEnoughBalance) {
      onError(new NotEnoughBalance('Not enough balance'));
    } else {
      onError(new Error('upload request failed!'));
    }
  }
};

export class NotEnoughBalance extends Error {}
