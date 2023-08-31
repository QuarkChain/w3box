// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./FlatDirectory.sol";

contract SimpleW3box {
    using Strings for uint256;

    event AAChange(address account, address aaAccount);

    modifier correctAuthor(address author){
        require(author != address(0) && aaMap[author] == msg.sender, "wrong author");
        _;
    }

    struct File {
        uint256 time;
        bytes name;
        bytes fileType;
    }

    struct FileInfos {
        File[] files;
        mapping(bytes32 => uint256) fileIds;
    }

    FlatDirectory public fileFD;
    string public shortNetwork;

    mapping(address => FileInfos) fileInfos;
    mapping(address => address) public aaMap; // User Account => AA Account

    constructor(string memory _shortNetwork) {
        shortNetwork = _shortNetwork;
        fileFD = new FlatDirectory(0);
    }

    function setAAAccountByAA(address account, uint8 v, bytes32 r, bytes32 s) public {
        require(verifyMessage(keccak256(abi.encodePacked(msg.sender)), v, r, s) == account, 'invalid user signature');
        aaMap[account] = msg.sender;
        emit AAChange(account, msg.sender);
    }

    function verifyMessage(bytes32 _hashedMessage, uint8 _v, bytes32 _r, bytes32 _s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }

    function write(address author, bytes memory name, bytes memory fileType, bytes calldata data) public {
        writeChunk(author, name, fileType, 0, data);
    }

    function writeChunk(
        address author,
        bytes memory name,
        bytes memory fileType,
        uint256 chunkId,
        bytes calldata data
    ) correctAuthor(author) public {
        FileInfos storage info = fileInfos[author];
        bytes32 nameHash = keccak256(name);
        if (info.fileIds[nameHash] == 0) {
            // first add file
            info.files.push(File(block.timestamp, name, fileType));
            info.fileIds[nameHash] = info.files.length;
        }

        fileFD.writeChunk(getNewName(author, name), chunkId, data);
    }

    function remove(address author, bytes memory name) correctAuthor(author) public returns (uint256) {
        FileInfos storage info = fileInfos[author];
        bytes32 nameHash = keccak256(name);
        require(info.fileIds[nameHash] != 0, "File does not exist");

        uint256 lastIndex = info.files.length - 1;
        uint256 removeIndex = info.fileIds[nameHash] - 1;
        if (lastIndex != removeIndex) {
            File storage lastFile = info.files[lastIndex];
            info.files[removeIndex] = lastFile;
            info.fileIds[keccak256(lastFile.name)] = removeIndex + 1;
        }
        info.files.pop();
        delete info.fileIds[nameHash];

        uint256 id = fileFD.remove(getNewName(author, name));
        return id;
    }

    function removes(address author, bytes[] memory names) public {
        uint256 length = names.length;
        for (uint8 i = 0; i < length; i++) {
            remove(author, names[i]);
        }
    }

    function getChunkHash(address author, bytes memory name, uint256 chunkId) public view returns (bytes32) {
        return fileFD.getChunkHash(getNewName(author, name), chunkId);
    }

    function countChunks(address author, bytes memory name) public view returns (uint256) {
        return fileFD.countChunks(getNewName(author, name));
    }

    function getUrl(bytes memory name) public view returns (string memory) {
        // https://file.w3q.w3q-g.w3link.io/0xb5a0ba79d7f63571b7ba81c9ab30e8f9a72b858f/coin.png
        return string(abi.encodePacked(
                'https://',
                Strings.toHexString(uint256(uint160(address(fileFD))), 20),
                '.',
                shortNetwork,
                '.w3link.io/',
                name
            ));
    }

    function getNewName(address author, bytes memory name) public pure returns (bytes memory) {
        return abi.encodePacked(
            Strings.toHexString(uint256(uint160(author)), 20),
            '/',
            name
        );
    }

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
}

