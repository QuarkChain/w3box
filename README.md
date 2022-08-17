# w3box

## Introduce
Based on the web3 chain, this project implements a decentralized website where anyone can upload public files without permission.
<br/>


## Structure
All the functions and data of this project are stored on the blockchain, realizing decentralization, which is implemented by three contracts, namely w3box.w3q, SimpleW3box and file.w3q.
<br/>

#### Implementation
FlatDirectory is the implementation of the web3 storage data contract. Click [here](https://docs.web3q.io/tutorials/migrate-your-website-to-web3q-in-5-mins) for details.

#### w3box.w3q
[w3box.w3q](https://galileo.web3q.io/w3ns.w3q/#/domains/w3box.w3q) is a w3ns domain name, which maps a contract address.
The contract mapped by w3box.w3q is a FlatDirectory contract that stores w3box's website files.

#### file.w3q
[file.w3q](https://galileo.web3q.io/w3ns.w3q/#/domains/file.w3q) is also a w3ns domain name, and its mapped FlatDirectory contract is used to store files uploaded by users.

#### SimpleW3box
SimpleW3box is used to manage the file information uploaded by users. It contains the file.w3q contract and all files will be uploaded to the file.w3q contract.
```
contract SimpleW3box {
    FlatDirectory public fileFD; // file.w3q contract
    mapping(address => FilesInfo) fileInfos; // User upload file mapping
    
    function writeChunk(bytes memory fileName, bytes memory fileType, uint256 chunkId, bytes calldata data) public payable {
        bytes32 nameHash = keccak256(fileName);
        FilesInfo storage info = fileInfos[msg.sender];
        if (info.fileIds[nameHash] == 0) {
            // first
            info.files.push(File(block.timestamp, name, fileType));
            info.fileIds[nameHash] = info.files.length;
        }
        // store byte data on-chain, 
        // because the gas fee has a maximum limit, the file is too large and needs to be split into multiple chunks for uploading
        fileFD.writeChunk{value: msg.value}(getNewName(msg.sender, name), chunkId, data);
    }
}
```

In file.w3q, the file is saved and read by name to avoid file name conflict, and the user address is added before the file name of each user to distinguish, the file name format (address/file name)
```
function getNewName(address author,bytes memory name) public pure returns (bytes memory) {
    return abi.encodePacked(Strings.toHexString(uint256(uint160(author)), 20),'/',name);
}
```

Get the user's file upload time, file name, file type, and file URL.
```
function getAuthorFiles(address author)
    public view
    returns (
        uint256[] memory times,
        bytes[] memory names,
        bytes[] memory types,
        string[] memory urls
    )
{
    uint256 length = fileInfos[author].files.length;
    times = new uint256[](length);
    names = new bytes[](length);
    types = new bytes[](length);
    urls = new string[](length);

    for (uint256 i; i < length; i++) {
        times[i] = fileInfos[author].files[i].time;
        names[i] = fileInfos[author].files[i].name;
        types[i] = fileInfos[author].files[i].fileType;
        urls[i] = getUrl(getNewName(author, names[i]));
    }
}
```

The web3q server can read the files in the contract according to the parameters in the URL, and supports that the contract in the URL is in the form of a domain name, so the files uploaded by the user can be accessed through the URL. The server URL details are [here](https://docs.web3q.io/advanced-topics/web3q-gateway).
```
function getUrl(bytes memory name) public view returns (string memory) {
    return string(abi.encodePacked(
        gateway,
        'file.w3q/',
        name
    ));
}
```
ex:
    https://galileo.web3q.io/file.w3q/0xb5a0ba79d7f63571b7ba81c9ab30e8f9a72b858f/coin.png

file.w3q is replaced with the contract address.

ex:
    https://galileo.web3q.io/0x37926Ea3020C114B4042F0ca86Ee5587A2b20D11:3334/0xb5a0ba79d7f63571b7ba81c9ab30e8f9a72b858f/coin.png

<br>

