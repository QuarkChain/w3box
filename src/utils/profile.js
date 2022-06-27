import { FileContract } from "./request";


// contract
export const getUploadByAddress = async (controller, address) => {
    const fileContract = FileContract(controller);
    const result = await fileContract.getAuthorFiles(address);
    return result;
}

export const deleteFile = async (controller, file) => {
    const fileContract = FileContract(controller);
    const result = await fileContract.remove(file);
    return result;
}
