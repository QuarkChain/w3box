import {ethers} from "ethers";
import { FileContract, getGateway } from "./request";

const hexToString = (h) => ethers.utils.toUtf8String(h);

// contract
export const getUploadByAddress = async (controller, address) => {
    const fileContract = FileContract(controller);
    const [chainId, fileFD, result] = await Promise.all([
        window.ethereum.request({method: "eth_chainId"}),
        fileContract.fileFD(),
        fileContract.getAuthorFiles(address),
    ]);
    const files = [];
    const times = result[0];
    const names = result[1];
    const types = result[2];
    for (let i = 0; i < names.length; i++) {
        const file = {
            time: new Date(parseInt(times[i], 10) * 1000),
            name: names[i],
            type: types[i],
            url: getGateway(chainId, fileFD) + address + "/" + hexToString(names[i]),
            showProgress: false
        };
        files.push(file);
    }
    files.sort(function (a, b) {
        return a.time - b.time
    });
    return files;
}

export const deleteFile = async (controller, file) => {
    const fileContract = FileContract(controller);
    const tx = await fileContract.remove(file);
    const receipt = await tx.wait();
    return receipt.status;
}

export const deleteFiles = async (controller, files) => {
    const fileContract = FileContract(controller);
    const tx = await fileContract.removes(files);
    const receipt = await tx.wait();
    return receipt.status;
}
