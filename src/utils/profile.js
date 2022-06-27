import { FileContract } from "./request";


// contract
export const getUploadByAddress = async (controller, address) => {
    const fileContract = FileContract(controller);
    const result = await fileContract.getAuthorFiles(address);
    return result;
}
