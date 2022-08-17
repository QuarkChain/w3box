# w3box

## Introduce
##### This project implements an open source website where anyone can upload public files without permission
<br>

## Implementation
FlatDirectory is a specific implementation contract for web3 chain storage. For details, please click [here](https://docs.web3q.io/tutorials/migrate-your-website-to-web3q-in-5-mins)

W3box implements storage based on FlatDirectory, The specific implementation is as follows.
```
contract SimpleW3box {
    FlatDirectory public fileFD; // data storage contract
    mapping(address => FilesInfo) fileInfos; // User upload file mapping
    
    function writeChunk(bytes memory name, bytes memory fileType, uint256 chunkId, bytes calldata data) public payable {
        bytes32 nameHash = keccak256(name);
        FilesInfo storage info = fileInfos[msg.sender];
        if (info.fileIds[nameHash] == 0) {
            // first add file
            info.files.push(File(block.timestamp, name, fileType));
            info.fileIds[nameHash] = info.files.length;
        }
        // store byte data on-chain, 
        // because the gas fee has a maximum limit, the file is too large and needs to be split into multiple chunks for uploading
        fileFD.writeChunk{value: msg.value}(getNewName(msg.sender, name), chunkId, data);
    }
}
```

Each file save and read using name as the key, and each user's file will be isolated according to the address, (address/filename)
```
function getNewName(address author,bytes memory name) public pure returns (bytes memory) {
    return abi.encodePacked(Strings.toHexString(uint256(uint160(author)), 20),'/',name);
}
```

Get the file uploaded by the user, return the upload time, file name, file type, and file url.
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

The web3q server can read the contract content by the browser, The contract
address can be mapped to w3ns domain name, the domain name in this application 
is file.w3q, The gateway details are as [this](https://docs.web3q.io/advanced-topics/web3q-gateway).

ex:
    https://galileo.web3q.io/file.w3q/0xb5a0ba79d7f63571b7ba81c9ab30e8f9a72b858f/coin.png

file.w3q replaced with a specific contract address.

ex:
    https://galileo.web3q.io/0x37926Ea3020C114B4042F0ca86Ee5587A2b20D11:3334/0xb5a0ba79d7f63571b7ba81c9ab30e8f9a72b858f/coin.png
```
function getUrl(bytes memory name) public view returns (string memory) {
    return string(abi.encodePacked(
        gateway,
        'file.w3q/',
        name
    ));
}
```
<br>



## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```


