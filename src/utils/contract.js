import {ethers} from "ethers";

const FileContractInfo = {
    abi: [
        "function setAAAccountByAA(address account, uint8 v, bytes32 r, bytes32 s) public",
        "function aaMap(address author) external view returns (address)",

        "function writeChunk(address author, bytes memory name, bytes memory fileType, uint256 chunkId, bytes calldata data) public payable",
        "function remove(address author, bytes memory name) external returns (uint256)",
        "function removes(address author, bytes[] memory names) public",
        "function countChunks(address author, bytes memory name) external view returns (uint256)",
        "function getChunkHash(address author, bytes memory name, uint256 chunkId) public view returns (bytes32)",
        "function getAuthorFiles(address author) public view returns (uint256[] memory times,bytes[] memory names,bytes[] memory types,string[] memory urls)",
    ],
};

export const FileContract = (address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(address, FileContractInfo.abi, provider);
    return contract.connect(provider.getSigner());
};