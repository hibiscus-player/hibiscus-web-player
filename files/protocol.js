/**
 * A class that contains static values, which represents
 * the different sizes of the different data units (in bytes).
 */
class DataSizes {
    static NONE = 0;
    static UINT8 = 1;
    static INT8 = 1;
    static UINT16 = 2;
    static INT16 = 2;
    static UINT32 = 4;
    static INT32 = 4;
    static UINT64 = 8;
    static INT64 = 8;
    static FLOAT = 4;
}
/**
 * A class that goes through a {@link DataView}.
 * It has a built in index, that increments after every read.
 * This is useful to pass to other objects without having to
 * keep track of changing the offsets.
 */
class DataViewReader {
    /**
     * The {@link DataView} that is being read.
     * @type {DataView}
     */
    _dv;
    /**
     * The current offset into the {@link DataView}.
     * @type {number}
     */
    _offset;
    /**
     * Creates a new DataViewReader from a DataView.
     * You can optionally specify an offset to start at.
     * 
     * @param {DataView} dataView the dataview to write to
     * @param {number} offset the offset to start at
     */
    constructor(dataView, offset=0) {
        this._dv = dataView;
        this._offset = offset;
    }
    /**
     * Reads an unsigned 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @returns {number} the read number
     */
    readUint8() {
        let result = this._dv.getUint8(this._offset);
        this._offset += DataSizes.UINT8;
        return result;
    }
    /**
     * Reads an unsigned 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @returns {number} the read number
     */
    readUint16() {
        let result = this._dv.getUint16(this._offset);
        this._offset += DataSizes.UINT16;
        return result;
    }
    /**
     * Reads an unsigned 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @returns {number} the read number
     */
    readUint32() {
        let result = this._dv.getUint32(this._offset);
        this._offset += DataSizes.UINT32;
        return result;
    }
    /**
     * Reads a signed 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @returns {number} the read number
     */
    readInt8() {
        let result = this._dv.getInt8(this._offset);
        this._offset += DataSizes.INT8;
        return result;
    }
    /**
     * Reads a signed 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @returns {number} the read number
     */
    readInt16() {
        let result = this._dv.getInt16(this._offset);
        this._offset += DataSizes.INT16;
        return result;
    }
    /**
     * Reads a signed 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @returns {number} the read number
     */
    readInt32() {
        let result = this._dv.getInt32(this._offset);
        this._offset += DataSizes.INT32;
        return result;
    }
    /**
     * Reads a 32-bit floating point number.
     * In Java this is commonly known as a `float`.
     * @returns {number} the read number
     */
    readFloat() {
        let result = this._dv.getFloat(this._offset);
        this._offset += DataSizes.FLOAT;
        return result;
    }
    /**
     * Reads a signed 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @returns {number} the read number
     */
    readInt64() {
        let result = this._dv.getBigInt64(this._offset);
        this._offset += DataSizes.INT64;
        return result;
    }
    /**
     * Reads an unsigned 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @returns {number} the read number
     */
    readUint64() {
        let result = this._dv.getBigUint64(this._offset);
        this._offset += DataSizes.UINT64;
        return result;
    }
    /**
     * Reads an UTF-16BE encoded string with the specified length.
     * If the length is 0, then `null` will be returned.
     * 
     * @param {number} length the length of the string to read (in characters)
     * @returns {string | null} the read string or `null` if the `length` is 0
     */
    readUTF16BEString(length) {
        if (length == 0) return null;
        let array = new Uint16Array(length);
        for (let charIndex = 0; charIndex < length; charIndex++) {
            array[charIndex] = this._dv.getUint16(this._offset + 2 * charIndex);
        }
        this._offset += DataSizes.UINT16 * length;

        // Actual UTF-16BE conversion
        return String.fromCharCode.apply(null, array);
    }
    /**
     * Skips the specified number of bytes. The offset of this
     * DataViewReader will be incremented (or decremented if negative) by `amount`.
     * @param {number} amount the amount of bytes to skip
     */
    skip(amount) {
        this._offset += amount;
    }
    /**
     * Returns the current offset of this DataViewReader.
     * @returns {number} the current offset (in bytes)
     */
    getOffset() {
        return this._offset;
    }
    /**
     * Sets the current offset of this DataViewReader to the specified value.
     * @param {number} offset the new offset (in bytes)
     */
    setOffset(offset) {
        this._offset = offset;
    }
}
/**
 * A class that is used for writing into a {@link DataView}.
 * It has a built in index, that increments after every write.
 * This is useful to pass to other objects without having to
 * keep track of changing the offsets.
 */
class DataViewWriter {
    /**
     * The {@link DataView} that is being written to.
     * @type {DataView}
     */
     _dv;
     /**
      * The current offset into the {@link DataView}.
      * @type {number}
      */
     _offset;
     /**
      * Creates a new DataViewWriter from a DataView.
      * You can optionally specify an offset to start at.
      * 
      * @param {DataView} dataView the dataview to write to
      * @param {number} offset the offset to start at
      */
    constructor(dataView, offset=0) {
        this._dv = dataView;
        this._offset = offset;
    }
    /**
     * Writes the specified value as an unsigned 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @param {number} value the value to write
     */
    writeUint8(value) {
        this._dv.setUint8(this._offset, value);
        this._offset += DataSizes.UINT8;
    }
    /**
     * Writes the specified value as an unsigned 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @param {number} value the value to write
     */
    writeUint16(value) {
        this._dv.setUint16(this._offset, value);
        this._offset += DataSizes.UINT16;
    }
    /**
     * Writes the specified value as an unsigned 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @param {number} value the value to write
     */
    writeUint32(value) {
        this._dv.setUint32(this._offset, value);
        this._offset += DataSizes.UINT32;
    }
    /**
     * Writes the specified value as a signed 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @param {number} value the value to write
     */
    writeInt8(value) {
        this._dv.setInt8(this._offset, value);
        this._offset += DataSizes.INT8;
    }
    /**
     * Writes the specified value as a signed 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @param {number} value the value to write
     */
    writeInt16(value) {
        this._dv.setInt16(this._offset, value);
        this._offset += DataSizes.INT16;
    }
    /**
     * Writes the specified value as a signed 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @param {number} value the value to write
     */
    writeInt32(value) {
        this._dv.setInt32(this._offset, value);
        this._offset += DataSizes.INT32;
    }
    /**
     * Writes the specified value as a 32-bit floating point integer.
     * In Java this is commonly known as a `float`.
     * @param {number} value the value to write
     */
    writeFloat(value) {
        this._dv.setFloat(this._offset, value);
        this._offset += DataSizes.FLOAT;
    }
    /**
     * Writes the specified value as a signed 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @param {number} value the value to write
     */
    writeInt64(value) {
        this._dv.setBigInt64(this._offset, value);
        this._offset += DataSizes.INT64;
    }
    /**
     * Writes the specified value as an unsigned 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @param {number} value the value to write
     */
    writeUint64(value) {
        this._dv.setBigUint64(this._offset, value);
        this._offset += DataSizes.UINT64;
    }
    /**
     * Writes the specified value as an UTF-16BE encoded string.
     * @param {string} value the string to write
     */
    writeUTF16BEString(value) {
        for (let charIndex = 0; charIndex < value.length; charIndex++) {
            this._dv.setUint16(this._offset + 2 * charIndex, value.charCodeAt(charIndex));
        }
        this._offset += DataSizes.UINT16 * value.length;
    }
    /**
     * Returns the underlying DataView object that this
     * DataViewWriter writes to.
     * @returns {DataView} the DataView
     */
    getView() {
        return this._dv;
    }
    /**
     * Returns the current offset of this DataViewWriter.
     * @returns {number} the current offset (in bytes)
     */
    getOffset() {
        return this._offset;
    }
    /**
     * Sets the current offset of this DataViewWriter to the specified value.
     * @param {number} offset the new offset (in bytes)
     */
    setOffset(offset) {
        this._offset = offset;
    }
}

/*
 * Client packet classes
 */

/**
 * Represents an unit of data, that is sent to the server from the client.
 * The client packets should have a different `packetId`.
 */
class ClientPacket {
    /**
     * Creates a new {@link DataView} object, and compresses the data
     * of this packet into it. This includes the packet ID that is
     * returned by `this.packetId()`.
     * @returns a new {@link DataView} object
     */
    compress() {
        let data = new DataViewWriter(new DataView(new ArrayBuffer(DataSizes.UINT8 + this.dataSize()), 0));
        data.writeUint8(this.packetId());
        this._compressImpl(data);
        return data.getView();
    }
    /**
     * Subclasses of ClientPacket should override this method to
     * implement the actual data compression into the specified
     * DataViewWriter.
     * @param {DataViewWriter} data the {@link DataViewWriter} to write into
     */
    _compressImpl(data) {}
    /**
     * Returns the size of the data contained in this ClientPacket.
     * This excludes the size of the packet ID byte.
     * Subclasses should override this method, and calculate their size.
     * 
     * See {@link DataSizes}.
     * @returns the size of the contained data (in bytes)
     */
    dataSize() {return 0;}
    /**
     * Returns the ID of this packet.
     * Subclasses should override this method and return their actual packet ID.
     * @returns {number} the ID of this packet
     */
    packetId() {return -1;}
}
class ClientHelloPacket extends ClientPacket {
    static IS_LOGIN_BIT = 0x01;
    static IS_MOBILE_BIT = 0x02;
    static IS_WEB_VERSION_BIT = 0x04;
    static IS_GUEST_BIT = 0x08;

    userFlags;
    profileId;
    constructor(userFlags, profileId) {
        super();
        this.userFlags = userFlags;
        this.profileId = profileId;
    }
    _compressImpl(data) {
        data.writeUint8(this.userFlags);
        if ((this.userFlags & ClientHelloPacket.IS_GUEST_BIT) == 0) {
            // Only write profile id if we are not a guest account
            data.writeUint8(this.profileId.length);
            data.writeUTF16BEString(this.profileId);
        }
    }
    dataSize() {
        return DataSizes.UINT8 + //user flags
                ((this.userFlags & ClientHelloPacket.IS_GUEST_BIT) > 0 ? 0 : DataSizes.UINT8 + //profile id length
                DataSizes.UINT16 * this.profileId.length); //profile id
    }
    packetId() {
        return 0;
    }
}
class ClientIdentityCompletePacket extends ClientPacket {
    constructor() {
        super();
    }
    _compressImpl(data, offset) {}
    dataSize() {
        return 0;
    }
    packetId() {
        return 1;
    }
}
class ClientPingPacket extends ClientPacket {
    data;
    constructor(data) {
        super();
        this.data = data;
    }
    _compressImpl(data) {
        data.writeUint64(BigInt(this.data));
    }
    dataSize() {
        return DataSizes.UINT64; //ID
    }
    packetId() {
        return 2;
    }
}
class ClientChangePagePacket extends ClientPacket {
    pageId;
    constructor(pageId) {
        super();
        this.pageId = pageId;
    }
    _compressImpl(data) {
        if (this.pageId == null) {
            data.writeUint16(0);
        } else {
            data.writeUint16(this.pageId.length);
            data.writeUTF16BEString(this.pageId);
        }
    }
    dataSize() {
        return DataSizes.UINT16 + //page id length
                (this.pageId != null ? DataSizes.UINT16 * this.pageId.length : 0); //page id
    }
    packetId() {
        return 3;
    }
}
class ClientPageActionPacket extends ClientPacket {
    /**
     * The client action.
     * @type {ClientAction}
     */
    action;
    /**
     * The value being sent to the server.
     * @type {*}
     */
    value;
    /**
     * The size of the value.
     * @type {number}
     */
    size;
    /**
     * 
     * @param {ClientAction} action the client action
     * @param {*} value the value to send to the server
     */
    constructor(action, value) {
        super();
        this.action = action;
        this.value = value;
        this.size = action.size(value);
    }
    _compressImpl(data) {
        data.writeUint32(this.action.getComponent().getComponentID());
        data.writeUint16(this.action.getClientActionId());
        data.writeUint32(this.size);
        this.action.serialize(data, this.value);
    }
    dataSize() {
        return DataSizes.UINT32 + // component ID
                DataSizes.UINT16 + // action ID
                DataSizes.UINT32 + // data size
                this.size;
    }
    packetId() {
        return 4;
    }
}

/**
 * This is an utiliy class that facilitates transforming data
 * from raw bytes to ServerPackets.
 */
const Protocol = {
    /**
     * Represents the registry of server packets.
     * @type {Object.<number, (data: DataViewWriter) => ServerPacket}
     */
    serverPacketMap: {},
    /**
     * Registers a server packet with the specified ID and supplier function.
     * @param {number} code the packet ID to register
     * @param {(data: DataViewWriter) => ServerPacket} supplier the function to create new ServerPacket instances
     */
    _register(code, supplier) {
        this.serverPacketMap[code] = supplier;
    },
    /**
     * Decodes an ArrayBuffer into a {@link ServerPacket}. The ArrayBuffer includes
     * the packet ID, which is used to determine which packet this ArrayBuffer represents.
     * 
     * @param {ArrayBuffer} compressed the compressed data as an ArrayBuffer
     * @returns {ServerPacket} the created ServerPacket instance
     */
    decodeServerPacket(compressed) {
        let data = new DataViewReader(new DataView(compressed));
        // Read the packet id
        let packetId = data.readUint8();
        // Create the packet from the mapping.
        return this.serverPacketMap[packetId](data);
    }
}

/*
 * Server packet classes
 */

/**
 * Represents an unit of data, that is sent to the client from the server.
 * The server packets should have a different `packetId`. Server packets
 * also need to be registered with {@link Protocol._register()}.
 */
class ServerPacket {
    /**
     * Creates a new ServerPacket instance from the specified DataViewReader.
     * The DataViewReader's offset should be set to the start of the data.
     * 
     * This method should read all available data from the DataViewReader,
     * and make it accessible as fields on this ServerPacket instance.
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {}
    /**
     * Handles this packet with the specified packet handler.
     * This method should be overridden to call the appropriate
     * method in {@link PacketHandler} that handles this specific
     * ServerPacket class. This is a faster solution than manually
     * checking the type of the packet.
     * @param {PacketHandler} handler the handler to use
     */
    handle(handler) {}
}
class ServerHelloPacket extends ServerPacket {
    /**
     * The name of the server.
     * @type {string}
     */
    serverName;
    /**
     * The MOTD of the server.
     * @type {string}
     */
    serverMotd;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super(data);
        this.serverName = data.readUTF16BEString(data.readUint8());
        this.serverMotd = data.readUTF16BEString(data.readUint8());
    }
    handle(handler) {handler.onHello(this)}
}
class ServerIdentityRequestPacket extends ServerPacket {
    /**
     * The server's identity request key.
     * @type {string}
     */
    serverKey;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super(data);
        this.serverKey = data.readUTF16BEString(data.readUint8());
    }
    handle(handler) {handler.onIdentityRequest(this)}
}
class ServerKickPacket extends ServerPacket {
    /**
     * The reason for the disconnection from the server.
     * @type {string}
     */
    kickReason;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super(data);
        this.kickReason = data.readUTF16BEString(data.readUint16());
    }
    handle(handler) {handler.onKick(this)}
}
class ServerPongPacket extends ServerPacket {
    /**
     * The same data that was supplied in the matching
     * {@link ClientPingPacket} that was sent previously.
     * @type {BigInt}
     */
    data;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super(data);
        this.data = data.readUint64();
    }
    handle(handler) {handler.onPong(this)}
}
class ServerWelcomePacket extends ServerPacket {
    /**
     * The user ID of the current user that has joined.
     * @type {string}
     */
    userId;
    /**
     * The nickname of the current user.
     * @type {string}
     */
    nickname;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super(data);
        this.userId = data.readUTF16BEString(data.readUint8());
        this.nickname = data.readUTF16BEString(data.readUint8());
    }
    handle(handler) {handler.onWelcome(this)}
}
class ServerPageListChangePacket extends ServerPacket {
    static PAGE_GROUPS_ADDED_BIT = 0x01;
    static PAGE_GROUPS_REMOVED_BIT = 0x02;
    static PAGE_GROUPS_UPDATED_BIT = 0x04;
    static PAGES_ADDED_BIT = 0x08;
    static PAGES_REMOVED_BIT = 0x10;
    static PAGES_UPDATED_BIT = 0x20;
    /**
     * An array of information about added page groups.
     * @type {Array<{groupId: string, groupName: string}>}
     */
    addedPageGroups;
    /**
     * An array of page group IDs which were removed.
     * @type {Array<string>}
     */
    removedPageGroups;
    /**
     * An array of information about updated page groups.
     * @type {Array<{groupId: string, groupName: string}>}
     */
    updatedPageGroups;
    /**
     * An array of information about added pages.
     * @type {Array<{pageId: string, groupId: string, pageName: string, pageIcon: string}>}
     */
    addedPages;
    /**
     * An array of page IDs which were removed.
     * @type {Array<string>}
     */
    removedPages;
    /**
     * An array of information about updated pages.
     * @type {Array<{pageId: string, groupId: string, pageName: string, pageIcon: string}>}
     */
    updatedPages;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super();
        this.addedPageGroups = [];
        this.removedPageGroups = [];
        this.updatedPageGroups = [];
        this.addedPages = [];
        this.removedPages = [];
        this.updatedPages = [];
        let mask = data.readUint8();
        if ((mask & ServerPageListChangePacket.PAGE_GROUPS_ADDED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let groupId = data.readUTF16BEString(data.readUint32());
                let groupName = data.readUTF16BEString(data.readUint32());
                this.addedPageGroups.push({
                    groupId: groupId,
                    groupName: groupName
                });
            }
        }
        if ((mask & ServerPageListChangePacket.PAGE_GROUPS_REMOVED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let groupId = data.readUTF16BEString(data.readUint32());
                this.removedPageGroups.push(groupId);
            }
        }
        if ((mask & ServerPageListChangePacket.PAGE_GROUPS_UPDATED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let groupId = data.readUTF16BEString(data.readUint32());
                let groupName = data.readUTF16BEString(data.readUint32());
                this.updatedPageGroups.push({
                    groupId: groupId,
                    groupName: groupName
                });
            }
        }
        if ((mask & ServerPageListChangePacket.PAGES_ADDED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let pageId = data.readUTF16BEString(data.readUint32());
                let groupId = data.readUTF16BEString(data.readUint32());
                let pageName = data.readUTF16BEString(data.readUint32());
                let pageIcon = data.readUTF16BEString(data.readUint32());
                this.addedPages.push({
                    pageId: pageId,
                    groupId: groupId,
                    pageName: pageName,
                    pageIcon: pageIcon
                });
            }
        }
        if ((mask & ServerPageListChangePacket.PAGES_REMOVED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let groupId = data.readUTF16BEString(data.readUint32());
                this.removedPages.push(groupId);
            }
        }
        if ((mask & ServerPageListChangePacket.PAGES_UPDATED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let pageId = data.readUTF16BEString(data.readUint32());
                let groupId = data.readUTF16BEString(data.readUint32());
                let pageName = data.readUTF16BEString(data.readUint32());
                let pageIcon = data.readUTF16BEString(data.readUint32());
                this.updatedPages.push({
                    pageId: pageId,
                    groupId: groupId,
                    pageName: pageName,
                    pageIcon: pageIcon
                });
            }
        }
    }
    handle(handler) {handler.onPageListChange(this)}
}
class ServerChangePagePacket extends ServerPacket {
    pageId;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super();
        this.pageId = data.readUTF16BEString(data.readUint16());
    }
    handle(handler) {handler.onChangePage(this)}
}
class ServerUpdatePagePacket extends ServerPacket {
    static COMPONENTS_ADDED_BIT = 0x01;
    static COMPONENTS_REMOVED_BIT = 0x02;
    static PROPERTIES_UPDATED_BIT = 0x04;
    /**
     * An array of information about added components.
     * This contains an offset into `reader`.
     * @type {Array<{componentId: number, type: string, offset: number}>}
     */
    addedComponents;
    /**
     * An array of component IDs which were removed.
     * @type {Array<number>}
     */
    removedComponents;
    /**
     * An array of information about updated properties.
     * This contains an offset into `reader`.
     * @type {Array<{componentId: number, propertyId: number, offset: number}>}
     */
    updatedProperties;
    /**
     * The {@link DataViewReader} that was used to create this ServerUpdatePagePacket.
     * @type {DataViewReader}
     */
    reader;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super();
        this.addedComponents = [];
        this.removedComponents = [];
        this.updatedProperties = [];
        this.reader = data;
        let mask = data.readUint8();
        if ((mask & ServerUpdatePagePacket.COMPONENTS_ADDED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let componentId = data.readUint32();
                let typeName = data.readUTF16BEString(data.readUint16());
                let dataLength = data.readUint16();
                let offset = data.getOffset();
                this.addedComponents.push({
                    componentId: componentId,
                    type: typeName,
                    offset: offset
                });
                data.skip(dataLength);
            }
        }
        if ((mask & ServerUpdatePagePacket.COMPONENTS_REMOVED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let componentId = data.readUint32();
                this.removedComponents.push(componentId);
            }
        }
        if ((mask & ServerUpdatePagePacket.PROPERTIES_UPDATED_BIT) > 0) {
            let amount = data.readUint32();
            for (let i = 0; i < amount; i++) {
                let componentId = data.readUint32();
                let propertyId = data.readUint16();
                let length = data.readUint16();
                let offset = data.getOffset();
                this.updatedProperties.push({
                    componentId: componentId,
                    propertyId: propertyId,
                    offset: offset
                });
                data.skip(length);
            }
        }
    }
    handle(handler) {handler.onUpdatePage(this)}
}
class ServerPageActionPacket extends ServerPacket {
    /**
     * The id of the component which this action was performed on.
     * @type {number}
     */
    componentId;
    /**
     * The id of the action which was performed.
     * @type {number}
     */
    actionId;
    /**
     * The offset in {@link data} where the data is located.
     * @type {number}
     */
    offset;
    /**
     * The DataViewReader which contains the data for this action
     * @type {DataViewReader}
     */
    data;
    /**
     * @param {DataViewReader} data the DataViewReader to read from
     */
    constructor(data) {
        super();
        this.componentId = data.readUint32();
        this.actionId = data.readUint16();
        this.offset = data.getOffset();
        this.data = data;
    }
    handle(handler) {handler.onChangePage(this)}
}
/*
 * Registering the server packets
 */
Protocol._register(0, (data)=>new ServerHelloPacket(data));
Protocol._register(1, (data)=>new ServerIdentityRequestPacket(data));
Protocol._register(2, (data)=>new ServerKickPacket(data));
Protocol._register(3, (data)=>new ServerPongPacket(data));
Protocol._register(4, (data)=>new ServerWelcomePacket(data));
Protocol._register(5, (data)=>new ServerPageListChangePacket(data));
Protocol._register(6, (data)=>new ServerChangePagePacket(data));
Protocol._register(7, (data)=>new ServerUpdatePagePacket(data));
Protocol._register(8, (data)=>new ServerPageActionPacket(data));
/*
 * Default protocol handler class
 */

/**
 * A class to handle packets, and connection state changes.
 * This class by default logs all packets sent
 * to the client from the server.
 */
class PacketHandler {
    /**
     * Logs some data.
     * @param {*} data the data to log
     * @protected
     */
    _log(data) {console.log(data);}
    /**
     * The connection was successful, and the client
     * has joined the server.
     */
    onJoin() {this._log("Joined the server");}
    /**
     * The connection has been terminated by the client.
     */
    onDisconnect() {this._log("Disconnecting from the server");}
    /**
     * The connection was unexpectedly terminated to the server.
     * @param {Event} event an event
     */
    onConnectionTerminate(event) {this._log("Connection terminated by the server");}
    /**
     * The connection was unsuccessful, and the specified error occurred.
     * @param {Error} error the error
     */
    onConnectionFail(error) {this._log("Connection failed");}

    /**
     * A handler method for the packet {@link ServerHelloPacket}.
     * @param {ServerHelloPacket} packet the packet
     */
    onHello(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerIdentityRequestPacket}.
     * @param {ServerIdentityRequestPacket} packet the packet
     */
    onIdentityRequest(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerKickPacket}.
     * @param {ServerKickPacket} packet the packet
     */
    onKick(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerPongPacket}.
     * @param {ServerPongPacket} packet the packet
     */
    onPong(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerWelcomePacket}.
     * @param {ServerWelcomePacket} packet the packet
     */
    onWelcome(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerPageListChangePacket}.
     * @param {ServerPageListChangePacket} packet the packet
     */
    onPageListChange(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerChangePagePacket}.
     * @param {ServerChangePagePacket} packet the packet
     */
    onChangePage(packet) {this._log(packet);}
    /**
     * A handler method for the packet {@link ServerUpdatePagePacket}.
     * @param {ServerUpdatePagePacket} packet the packet
     */
    onUpdatePage(packet) {this._log(packet);}
}