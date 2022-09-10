/*
 * Server Actions
 */
class ServerAction {
    /**
     * The ID of this action.
     * @type {number}
     */
    _id;
    /**
     * The Handler for this action.
     * @type {null|(value:*)=>void}
     */
    _handler;
    /**
     * Creates a new ServerAction.
     * @param {number} id the server action id
     * @param {null|(value:*)=>void} handler the handler to use
     */
    constructor(id, handler=null) {
        this._id = id;
        this._handler = handler;
    }
    /**
     * Returns the server action id.
     * @returns {number} the server action id
     */
    getServerActionId() {
        return this._id;
    }
    /**
     * Sets the handler function for this server action;
     * @param {null|(value:*)=>void} handlerFunction the handler function
     */
    setHandler(handlerFunction) {
        this._handler = handlerFunction;
    }
    /**
     * Handles this server action.
     * @param {*} value the value
     */
    handle(value) {
        if (this._handler != null) this._handler(value);
    }
    /**
     * Deserializes a value.
     * @param {DataViewReader} data the DataViewReader to read from
     * @returns {*}
     */
    deserialize(data) {}
}
class VoidServerAction extends ServerAction {
    /**
     * Creates a new VoidServerAction.
     * @param {number} id the server action id
     * @param {null|(value:*)=>void} handler the handler to use
     */
    constructor(id, handler=null) {
        super(id, handler);
    }
    /**
     * Deserializes a value.
     * @param {DataViewReader} data the DataViewReader to read from
     * @returns {void}
     */
    deserialize(data) {}
}
class StringServerAction extends ServerAction {
    constructor(id, handler=null) {
        super(id, handler);
    }
    /**
     * Deserializes a value.
     * @param {DataViewReader} data the DataViewReader to read from
     * @returns {string}
     */
    deserialize(data) {
        return data.readUTF16BEString(data.readInt32());
    }
}

/*
 * Client Actions
 */
class ClientAction {
    /**
     * The owner component.
     * @type {UIComponent}
     */
    _component;
    /**
     * The client action id.
     * @type {number}
     */
    _id;
    /**
     * Creates a new ClientAction.
     * @param {UIComponent} component the parent component
     * @param {number} id the client action id
     */
    constructor(component, id) {
        this._component = component;
        this._id = id;
    }
    getComponent() {
        return this._component;
    }
    getClientActionId() {
        return this._id;
    }
    /**
     * Returns the size of the specified value in bytes.
     * @param {*} value the value
     * @returns the size of the value (in bytes)
     */
    size(value) {return 0;}
    /**
     * Serializes the specified value into the specified data writer.
     * @param {DataViewWriter} data the DataViewWriter to write into
     * @param {*} value the value to serialize
     */
    serialize(data, value) {}
    /**
     * Sends this action with the specified value to the server.
     * @param {*} value the value to send
     */
    send(value) {
        Hibiscus.getCurrentServerConnection().sendPacket(new ClientPageActionPacket(this, value));
    }
}
class VoidClientAction extends ClientAction {
    /**
     * Creates a new VoidClientAction.
     * @param {UIComponent} component the parent component
     * @param {number} id the client action id
     */
     constructor(component, id) {
        super(component, id);
    }
    /**
     * Returns the size of the specified value in bytes.
     * @param {void} value the value
     * @returns the size of the value (in bytes)
     */
    size(value) {return 0;}
    /**
     * Serializes the specified value into the specified data writer.
     * @param {DataViewWriter} data the DataViewWriter to write into
     * @param {void} value the value to serialize
     */
    serialize(data, value) {}
}
class StringClientAction extends ClientAction {
    /**
     * Creates a new StringClientAction.
     * @param {UIComponent} component the parent component
     * @param {number} id the client action id
     */
     constructor(component, id) {
        super(component, id);
    }
    /**
     * Returns the size of the specified value in bytes.
     * @param {string} value the value
     * @returns the size of the value (in bytes)
     */
    size(value) {return 4 + value.length*2;}
    /**
     * Serializes the specified value into the specified data writer.
     * @param {DataViewWriter} data the DataViewWriter to write into
     * @param {string} value the value to serialize
     */
    serialize(data, value) {
        data.writeUint32(value.length);
        data.writeUTF16BEString(value);
    }
}