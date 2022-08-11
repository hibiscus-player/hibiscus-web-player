const Hibiscus = {
    CORE_URL: "http://hibiscus-player.ddns.net",
    _init: false,
    _sceneManager: null,
    _serverManager: null,
    _selfUserManager: null,
    init() {
        this._init = true;
        this._sceneManager = new SceneManager();
        this._serverManager = new ServerManager();
        this._serverManager.loadLocalStorage();
        this._selfUserManager = new SelfUserManager();

        UIManager._init();

        let query = new URLSearchParams(window.location.search);
        if (query.has("server")) {
            let targetServer = query.get("server");
            // TODO connect directly
        }
    },
    /**
     * Returns the SceneManager object.
     * @returns {SceneManager} the SceneManager object
     */
    getSceneManager() {
        return this._sceneManager;
    },
    /**
     * Returns the ServerManager object.
     * @returns {ServerManager} the ServerManager object
     */
    getServerManager() {
        return this._serverManager;
    },
    /**
     * Returns the SelfUserManager object.
     * @returns {SelfUserManager} the SelfUserManager object
     */
    getSelfUserManager() {
        return this._selfUserManager;
    },
    /**
     * Returns the main ServerConnection object.
     * @returns {ServerConnection} the main ServerConnection object
     */
    getCurrentServerConnection() {
        return this._serverManager.getCurrentServerConnection();
    }

}
class ServerManager {
    static CONCURRENT_PING_COUNT = 1;
    /**
     * An array containing ServerData objects.
     * @type {Array<ServerData>}
     */
    _servers;
    _serverListObject;
    _serverListLastObject;
    _mainServerConnection;
    /**
     * A list of the currently available ServerConnection objects
     * to use for pinging servers. This is used to allow for
     * multiple concurrent server pings.
     * @type {Array<ServerConnection>}
     */
    _availablePingServerConnections;
    /**
     * A queue of ServerData objects to ping.
     * @type {Array<ServerData>}
     */
    _pingQueue;
    constructor() {
        this._servers = [];
        this._serverListObject = document.querySelector("#selector_server_list");
        this._serverListLastObject = document.querySelector("#selector_server_last");
        let addButton = document.querySelector("#selector_server_add_button");
        addButton.onclick = ()=>{
            Hibiscus.getSceneManager().getSelectorScene().openServerEditor("Add Server", "ws://", "Add").then((result)=>{
                let serverData = new ServerData(this, result.address, "Server");
                this._registerServerData(serverData);
            }).catch(()=>{
                // Do not add any server, ignore
            });
        };
        let refreshAllButton = document.querySelector("#selector_server_refresh_button");
        refreshAllButton.onclick = ()=>{
            for (let server of this._servers) {
                if (server._state != ServerState.PING_QUEUED && server._state != ServerState.PINGING) {
                    this.queuePing(server);
                }
            }
        };
        this._mainServerConnection = new ServerConnection();
        this._availablePingServerConnections = [];
        this._pingQueue = [];
        for (let i = 0; i < ServerManager.CONCURRENT_PING_COUNT; i++) {
            this._availablePingServerConnections.push(new ServerConnection());
        }
    }
    /**
     * Pings the specified server.
     * @param {ServerData} serverData the server to ping
     */
    queuePing(serverData) {
        serverData.updateState(ServerState.PING_QUEUED);
        this._pingQueue.push(serverData);
        this._checkPingQueue();
    }
    _checkPingQueue() {
        if (this._pingQueue.length == 0) return;
        if (this._availablePingServerConnections == 0) return;

        let connection = this._availablePingServerConnections.shift();
        let toPing = this._pingQueue.shift();
        toPing.updateState(ServerState.PINGING);
        connection.ping(toPing.getAddress()).then((data)=>{
            toPing.updateData(data.serverName, data.serverMotd, data.ping);
            this._availablePingServerConnections.push(connection);
            this._checkPingQueue();
        }).catch((error)=>{
            toPing.updateState(error.errorState);
            this._availablePingServerConnections.push(connection);
            this._checkPingQueue();
        });
    }
    /**
     * Returns the main ServerConnection object.
     * @returns {ServerConnection} the main ServerConnection object
     */
    getMainServerConnection() {
        return this._mainServerConnection;
    }
    /**
     * Returns the ServerConnection object for the current server connection.
     * @returns {ServerConnection} the main ServerConnection object
     */
    getCurrentServerConnection() {
        return this._mainServerConnection.isConnected() ? this._mainServerConnection : null;
    }
    loadLocalStorage() {
        let serializedArray = JSON.parse(localStorage.getItem("servers"));
        if (serializedArray == null) {
            // Save an empty array
            this.saveLocalStorage();
            return;
        }
        for (let serialized of serializedArray) {
            let sd = ServerData.deserialize(this, serialized);
            this._registerServerData(sd);
        }
    }
    saveLocalStorage() {
        let array = [];
        for (let server of this._servers) {
            array.push(server.serialize());
        }
        localStorage.setItem("servers", JSON.stringify(array));
    }
    /**
     * Registers the specified ServerData.
     * @param {ServerData} serverData the ServerData to register
     */
    _registerServerData(serverData) {
        this._serverListObject.insertBefore(serverData._rootObject, this._serverListLastObject);
        this._servers.push(serverData);
        this.queuePing(serverData);
    }
    /**
     * Removes a server from the server list.
     * @param {ServerData} serverData the ServerData to remove
     */
    remove(serverData) {
        this._serverListObject.removeChild(serverData._rootObject);
        this._servers.splice(this._servers.indexOf(serverData), 1);
        this.saveLocalStorage();
    }
    /**
     * Connects to the specified server.
     * @param {ServerData} serverData the ServerData to connect to
     */
    connect(serverData) {
        serverData.setLoader(true);
        this._mainServerConnection.login(serverData.getAddress()).then(()=>{
            Hibiscus.getSceneManager().selectScene(Hibiscus.getSceneManager().getServerScene());
            serverData.setLoader(false);
        }).catch(()=>{
            serverData.setLoader(false);
        });
    }
    /**
     * Connects to the specified server.
     * @param {string} address the address to connect to
     */
    connectDirect(address) {
        this._mainServerConnection.login(address).then(()=>{
            Hibiscus.getSceneManager().selectScene(Hibiscus.getSceneManager().getServerScene());
        }).catch(()=>{

        });
    }
}
class ServerState {
    static UNKNOWN = new ServerState("unknown", "???");
    static PING_QUEUED = new ServerState("ping_queued", "Queued...");
    static PINGING = new ServerState("pinging", "Pinging...");
    static PING_FAIL = new ServerState("ping_fail", "Failed to ping the server.");
    static PING_ERROR = new ServerState("ping_error", "The server sent an invalid response.");
    static CONNECTABLE = new ServerState("connectable", " "); // Invisible character, to make the screen consistent

    /**
     * The name of the CSS class to apply to the root element.
     * @type {string}
     */
    _className;
    /**
     * The status text to display in this state, or `null` for no status text.
     * @type {string|null}
     */
    _statusText;
    constructor(className, statusText) {
        this._className = className;
        this._statusText = statusText;
    }
    /**
     * Applies this state to the specified ServerData
     * @param {ServerData} serverData the ServerData to apply to
     */
    apply(serverData) {
        serverData._rootObject.classList.add(this._className);
        if (this._statusText != null) serverData._descriptionFader.changeToFast(this._statusText);
    }
    /**
     * Removes this state from the specified ServerData
     * @param {ServerData} serverData the ServerData to remove from
     */
    remove(serverData) {
        serverData._rootObject.classList.remove(this._className);
    }
}
class ServerData {
    /**
     * The ServerManager object that this ServerData was created with.
     * @type {ServerManager}
     */
    _serverManager;
    /**
     * The name of this server.
     * @type {string}
     */
    _serverName;
    /**
     * The MOTD of this server.
     * @type {string}
     */
    _serverMotd;
    /**
     * The ping to this server.
     * @type {number}
     */
    _ping;
    /**
     * The address of this server.
     * @type {string}
     */
    _address;
    /**
     * The current state of this server. One of:
     * - {@link ServerState.UNKNOWN}
     * - {@link ServerState.PING_QUEUED}
     * - {@link ServerState.PINGING}
     * - {@link ServerState.PING_FAIL}
     * - {@link ServerState.PING_ERROR}
     * - {@link ServerState.CONNECTABLE}
     * @type {ServerState}
     */
    _state;

    /**
     * The HTML object in the server selector.
     * @type {HTMLElement}
     */
    _rootObject;
    _nameFader;
    _descriptionFader;
    _loaderObject;
    /**
     * Creates a new ServerData object from the
     * serialized form.
     * @param {ServerManager} serverManager a ServerManager object
     * @param {{address: string, lastKnownName: string}} serialized the serialized form of this server
     * @returns {ServerData} the deserialized ServerData
     */
    static deserialize(serverManager, serialized) {
        return new ServerData(serverManager, serialized.address, serialized.lastKnownName);
    }
    /**
     * Creates a new ServerData object.
     * @param {ServerManager} serverManager a ServerManager object
     * @param {string} address the address of this server
     * @param {string} lastKnownName the last known name for this server
     */
    constructor(serverManager, address, lastKnownName) {
        this._serverManager = serverManager;
        this._address = address;
        this._serverName = lastKnownName;

        this._rootObject = document.createElement("div");
        this._rootObject.classList.add("selector_server");
        let texts = document.createElement("div");
        texts.classList.add("selector_server_texts");
        this._rootObject.appendChild(texts);

        let nameObject = document.createElement("div");
        nameObject.classList.add("selector_server_name");
        nameObject.innerText = this._serverName;
        nameObject.translate = false;
        this._nameFader = new FadingTextChanger(nameObject, 200);
        texts.appendChild(nameObject);

        let descriptionObject = document.createElement("div");
        descriptionObject.classList.add("selector_server_motd");
        this._descriptionFader = new FadingTextChanger(descriptionObject, 200);
        texts.appendChild(descriptionObject);

        let buttons = document.createElement("div");
        buttons.classList.add("selector_server_buttons");
        this._rootObject.appendChild(buttons);

        let deleteBtn = document.createElement("div");
        deleteBtn.textContent = "delete";
        deleteBtn.classList.add("selector_server_button_delete");
        deleteBtn.classList.add("selector_server_button");
        deleteBtn.classList.add("material-symbols-outlined");
        deleteBtn.translate = false;
        deleteBtn.onclick = ()=>{
            this._serverManager.remove(this);
        };
        buttons.appendChild(deleteBtn);

        let editBtn = document.createElement("div");
        editBtn.textContent = "Edit";
        editBtn.classList.add("selector_server_button");
        editBtn.classList.add("material-symbols-outlined");
        editBtn.translate = false;
        editBtn.onclick = ()=>{
            Hibiscus.getSceneManager().getSelectorScene().openServerEditor("Edit Server", this._address, "Save").then((result)=>{
                if (this._address != result.address) {
                    this._address = result.address;
                    this._serverManager.queuePing(this);
                }
                this._serverManager.saveLocalStorage();
            }).catch((reason)=>{
                // Do not save the server, ignore
            });
        };
        buttons.appendChild(editBtn);

        let connectBtn = document.createElement("div");
        connectBtn.textContent = "login";
        connectBtn.classList.add("selector_server_button_connect");
        connectBtn.classList.add("selector_server_button");
        connectBtn.classList.add("material-symbols-outlined");
        connectBtn.translate = false;
        connectBtn.onclick = ()=>{
            this._serverManager.connect(this);
        };
        buttons.appendChild(connectBtn);

        this._loaderObject = document.createElement("div");
        this._loaderObject.classList.add("selector_server_loader");
        buttons.appendChild(this._loaderObject);

        this._state = ServerState.UNKNOWN;
        this.updateState(ServerState.UNKNOWN);
    }
    serialize() {
        return {
            address: this._address,
            lastKnownName: this._serverName
        };
    }
    getServerName() {
        return this._serverName;
    }
    getServerMotd() {
        return this._serverMotd;
    }
    getPing() {
        return this._ping;
    }
    getAddress() {
        return this._address;
    }
    setLoader(value) {
        if (value) {
            this._loaderObject.classList.add("joining");
        } else {
            this._loaderObject.classList.remove("joining");
        }
    }
    updateState(state) {
        this._state.remove(this);
        this._state = state;
        state.apply(this);
    }
    updateData(name, motd, ping) {
        this.updateState(ServerState.CONNECTABLE);

        this._serverName = name;
        this._nameFader.changeTo(name);

        this._serverMotd = motd;
        this._descriptionFader.changeTo(motd);

        this._ping = ping;
        this._serverManager.saveLocalStorage();
    }
}
class SelfUserManager {
    /**
     * The icon URL for the guest icon. This icon is displayed when
     * the user has not logged in (yet).
     */
    static GUEST_ICON_URL = "assets/guest.svg";
    /**
     * The name of the user.
     * @type {string}
     */
    _name;
    /**
     * The icon URL of this user.
     * @type {string}
     */
    _icon_url;
    /**
     * The profile ID of this user. This is the public user id from Firebase.
     * @type {string}
     */
    _profileId;
    /**
     * The access token of this user. This is the access key received from Firebase,
     * and is used during authentication.
     * @type {string}
     */
    _accessToken;
    /**
     * `true` if the current device is a mobile device.
     * @type {boolean}
     */
    _mobile;

    _selector_name_fader;
    _selector_icon_fader;

    _server_name_fader;
    _server_icon_fader;
    constructor() {
        this._isMobile = /Mobi/i.test(window.navigator.userAgent);
        this._selector_name_fader = new FadingTextChanger(document.querySelector("#selector_user_name"));
        this._selector_icon_fader = new FadingImageChanger(document.querySelector("#selector_user_icon"));

        this._server_name_fader = new FadingTextChanger(document.querySelector("#self_user_data #user_name"));
        this._server_icon_fader = new FadingImageChanger(document.querySelector("#self_user_data #user_icon"));

        Hibiscus.getSceneManager().getServerScene().setInstallDesktop(!this._isMobile);
        
        firebaseData.init((user)=>{
            if (user != null) {
                this._name = user.displayName;
                this._icon_url = user.photoURL;
                this._profileId = user.uid;
                this._accessToken = user.accessToken;
            } else {
                this._name = "Guest";
                this._icon_url = SelfUserManager.GUEST_ICON_URL;
                this._profileId = null;
            }

            this._selector_name_fader.changeTo(this._name);
            this._selector_icon_fader.changeTo(this._icon_url);
            this._server_name_fader.changeTo(this._name);
            this._server_icon_fader.changeTo(this._icon_url);

            Hibiscus.getSceneManager().getSelectorScene().setSignedIn(user != null);
            Hibiscus.getSceneManager().getSelectorScene().setLoaderVisible(false);
        });
    }
    isGuest() {
        return this._profileId == null;
    }
    isMobile() {
        return this._isMobile;
    }
    getUserName() {
        return this._name;
    }
    getUserIconUrl() {
        return this._icon_url;
    }
    getProfileId() {
        return this._profileId;
    }
    async performIdentityCheck(serverKey) {
        let promise = new LazyPromise();
        let xhr = new XMLHttpRequest();
        xhr.open("POST", Hibiscus.CORE_URL + "/api/v1/joinServer");
        xhr.setRequestHeader("Authorization", this._accessToken);
        xhr.setRequestHeader("X-Server-Key", serverKey);
        xhr.onerror = (e)=>{
            promise.reject(e);
        };
        xhr.onload = ()=>{
            if (xhr.status == 200) promise.resolve(JSON.parse(xhr.responseText));
            else promise.reject(null);
        }
        xhr.send();
        return promise.getPromise();
    }
}
class UserData {
    _nickname;
    _displayName;
    _photoUrl;
    _userId;
    _devices;
    constructor(userId) {
        this._userId = userId;
        this._devices = [];
    }
    setNickname(nickname) {
        this._nickname = nickname;
    }
    getNickname() {
        return this._nickname;
    }
    setDisplayName(displayName) {
        this._displayName = displayName;
    }
    getDisplayName() {
        return this._displayName;
    }
    setPhotoUrl(photoUrl) {
        this.photoUrl = photoUrl;
    }
    getPhotoUrl() {
        return this.photoUrl;
    }
    getUserId() {
        return this._userId;
    }
    getDevices() {
        return this._devices;
    }
}
class DeviceData {
    _deviceFlags;
    _deviceId;
    constructor(userFlags, deviceId) {
        this._deviceFlags = userFlags;
        this._deviceId = deviceId;
    }
    isMobile() {
        return (this._deviceFlags & ClientHelloPacket.IS_MOBILE_BIT) > 0;
    }
    isWebVersion() {
        return (this._deviceFlags & ClientHelloPacket.IS_WEB_VERSION_BIT) > 0;
    }
    isGuest() {
        return (this._deviceFlags & ClientHelloPacket.IS_GUEST_BIT) > 0;
    }
}
/**
 * A class responsible for handling connection to a server.
 * This class is reusable, meaning that if you want to
 * connect to a new server, you don't have to create a new
 * instance.
 */
class ServerConnection {
    /**
     * The current WebSocket instance, if there is an open connection.
     * If there are no connections, then this is `null`.
     * @type {WebSocket}
     */
    _websocket;
    /**
     * The current PacketHandler instance.
     * @type {PacketHandler}
     */
    _handler;
    /**
     * A boolean, where `true` means this ServerConnection
     * has an open connection to a server.
     * @type {boolean}
     */
    _connected;
    constructor() {
        this._websocket = null;
        this._handler = null;
        this._connected = null;
    }
    _connect(address) {
        if (this._handler == null) throw new Error("Cannot connect without a handler set.");
        if (this._websocket != null) this.disconnect();
        try {
            this._websocket = new WebSocket(address);
        } catch (error) {
            // An error might get thrown if the address is not valid, handle it here.
            //TODO make a different error reason about the address being invalid
            this._handler.onConnectionFail(error);
            return;
        }
        this._websocket.binaryType = "arraybuffer";
        this._websocket.onopen = (_) => {
            this._connected = true;
            this._handler.onJoin();
        };
        this._websocket.onmessage = msg => {
            let packet = Protocol.decodeServerPacket(msg.data);
            packet.handle(this._handler);
        };
        this._websocket.onclose = (e) => {
            if (this.isConnected()) {
                // Remote closed the connection
                this._handler.onConnectionTerminate(e);
                this._handler = null;
                this._websocket = null;
                this._connected = false;
            } else {
                // We closed the connection, everything's already handled
            }
        };
        this._websocket.onerror = (e) => {
            this._handler.onConnectionFail(e);
            this._handler = null;
            this._websocket = null;
            this._connected = false;
        }
    }
    async login(address) {
        let lazy = new LazyPromise();
        this._handler = new MainHandler(this, lazy);
        this._connect(address);
        return lazy.getPromise();
    }
    /**
     * Pings the specified server.
     * @param {string} address the address to ping
     * @returns {Promise<{ping: string, serverName: string, serverMotd: string}>}
     */
    async ping(address) {
        let lazy = new LazyPromise();
        this._handler = new PingHandler(this, lazy);
        this._connect(address);
        return lazy.getPromise();
    }
    disconnect() {
        if (this.isConnected()) {
            this._handler.onDisconnect();
            this._handler = null;
            this._connected = false;
            this._websocket.close();
            this._websocket = null;
        }
    }
    isConnected() {
        return this._connected;
    }
    sendPacket(packet) {
        if (!this._connected) return;
        this._websocket.send(packet.compress());
    }
}
class PingHandler extends PacketHandler {
    /**
     * The ServerConnection of this PacketHandler. Used to send packets.
     * @type {ServerConnection}
     */
    _connection;
    /**
     * The LazyPromise object, that will be completed
     * when the ping succeeds/fails.
     * @type {LazyPromise}
     */
    _lazyPromise;

    /**
     * The server name, if known. Otherwise, this variable will be `null`.
     * @type {string|null}
     */
    _serverName;
    /**
     * The server MOTD, if known. Otherwise, this variable will be `null`.
     * @type {string|null}
     */
    _serverMotd;
    /**
     * The ping to the server, if known. Otherwise, this variable will be `-1`.
     * @type {string}
     */
    _ping;
    /**
     * Creates a new PingHandler.
     * @param {ServerConnection} connection the ServerConnection to use
     * @param {LazyPromise} lazyPromise the LazyPromise to complete
     */
    constructor(connection, lazyPromise) {
        super();
        this._connection = connection;
        this._lazyPromise = lazyPromise;

        this._serverName = null;
        this._serverMotd = null;
        this._ping = -1;
    }

    onJoin() {
        let userFlags = 0;
        userFlags|=ClientHelloPacket.IS_WEB_VERSION_BIT;
        let profileId = null;
        if (Hibiscus.getSelfUserManager().isMobile()) userFlags|=ClientHelloPacket.IS_MOBILE_BIT;
        if (Hibiscus.getSelfUserManager().isGuest()) {
            userFlags|=ClientHelloPacket.IS_GUEST_BIT;
        } else {
            profileId = Hibiscus.getSelfUserManager().getProfileId();
        }
        this._connection.sendPacket(new ClientHelloPacket(userFlags, profileId));
    }
    onDisconnect() {

    }
    onConnectionTerminate(event) {
        if (this._serverName != null && this._serverMotd != null) {
            this._lazyPromise.resolve({
                ping: this._ping,
                serverName: this._serverName,
                serverMotd: this._serverMotd,
            });
        } else {
            this._lazyPromise.reject({
                errorState: ServerState.PING_ERROR,
                kickReason: packet.kickReason
            });
        }
    }
    onConnectionFail(error) {
        this._lazyPromise.reject({
            errorState: ServerState.PING_FAIL
        });
    }
    /**
     * A handler method for the packet {@link ServerHelloPacket}.
     * @param {ServerHelloPacket} packet the packet
     */
    onHello(packet) {
        this._serverName = packet.serverName;
        this._serverMotd = packet.serverMotd;
        this._ping = Date.now();
        this._connection.sendPacket(new ClientPingPacket(this._ping));
    }
    /**
     * A handler method for the packet {@link ServerKickPacket}.
     * @param {ServerKickPacket} packet the packet
     */
    onKick(packet) {
        if (this._serverName != null && this._serverMotd != null) {
            this._lazyPromise.resolve({
                ping: this._ping,
                serverName: this._serverName,
                serverMotd: this._serverMotd,
            });
        } else {
            this._lazyPromise.reject({
                errorState: ServerState.PING_ERROR,
                kickReason: packet.kickReason
            });
        }
    }
    /**
     * A handler method for the packet {@link ServerPongPacket}.
     * @param {ServerPongPacket} packet the packet
     */
    onPong(packet) {
        if (packet.data == BigInt(this._ping)) {
            let now = Date.now();
            let actualPing = now - this._ping;
            this._lazyPromise.resolve({
                ping: actualPing,
                serverName: this._serverName,
                serverMotd: this._serverMotd
            });
            this._connection.disconnect();
        }
    }
}
class MainHandler extends PacketHandler {
    /**
     * The ServerConnection of this PacketHandler. Used to send packets.
     * @type {ServerConnection}
     */
    _connection;
    /**
     * The LazyPromise object, that will be completed
     * when the ping succeeds/fails.
     * @type {LazyPromise}
     */
    _lazyPromise;
    /**
     * Creates a new PingHandler.
     * @param {ServerConnection} connection the ServerConnection to use
     * @param {LazyPromise} lazyPromise the LazyPromise to complete
     */
    constructor(connection, lazyPromise) {
        super();
        this._connection = connection;
        this._lazyPromise = lazyPromise;
    }
    onJoin() {
        let userFlags = ClientHelloPacket.IS_LOGIN_BIT;
        userFlags|=ClientHelloPacket.IS_WEB_VERSION_BIT;
        let profileId = null;
        if (Hibiscus.getSelfUserManager().isMobile()) userFlags|=ClientHelloPacket.IS_MOBILE_BIT;
        if (Hibiscus.getSelfUserManager().isGuest()) {
            userFlags|=ClientHelloPacket.IS_GUEST_BIT;
        } else {
            profileId = Hibiscus.getSelfUserManager().getProfileId();
        }
        this._connection.sendPacket(new ClientHelloPacket(userFlags, profileId));
    }
    onConnectionTerminate() {
        this._lazyPromise.reject({
            error: "terminated",
            code: error.code
        });
    }
    onConnectionFail() {
        this._lazyPromise.reject({
            error: "failed"
        });
    }
    onDisconnect() {

    }
    /**
     * A handler method for the packet {@link ServerHelloPacket}.
     * @param {ServerHelloPacket} packet the packet
     */
    onHello(packet) {
        // Currently unused
        // TODO maybe display the information somewhere
    }
    /**
     * A handler method for the packet {@link ServerIdentityRequestPacket}.
     * @param {ServerIdentityRequestPacket} packet the packet
     */
    onIdentityRequest(packet) {
        console.log("Performing identity check as " + Hibiscus.getSelfUserManager().getProfileId() + "...");
        Hibiscus.getSelfUserManager().performIdentityCheck(packet.serverKey)
            .then((result)=>{
                console.log("Completed identity check.");
                this._connection.sendPacket(new ClientIdentityCompletePacket());
            })
            .catch((error)=>{
                this._connection.disconnect();
            });
    }
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
    onWelcome(packet) {
        this._log(packet);
        UIManager.clearData();
        this._lazyPromise.resolve();
    }
    /**
     * A handler method for the packet {@link ServerPageListChangePacket}.
     * @param {ServerPageListChangePacket} packet the packet
     */
    onPageListChange(packet) {
        for (let addedGroup of packet.addedPageGroups) {
            let group = new UIPageGroup(addedGroup.groupId, addedGroup.groupName);
            UIManager.registerPageGroup(group);
        }
        for (let removedGroupId of packet.removedPageGroups) {
            UIManager.removePageGroup(removedGroupId);
        }
        for (let updatedGroup of packet.updatedPageGroups) {
            let group = UIManager.getPageGroup(updatedGroup.groupId);
            group.setName(updatedGroup.groupName);
        }
        for (let addedPage of packet.addedPages) {
            let page = new UIPage(addedPage.pageId, addedPage.pageName, addedPage.pageIcon);
            UIManager.registerPage(page);
            let group = UIManager.getPageGroup(addedPage.groupId);
            if (group != null) {
                page.setGroup(group);
            }
        }
        for (let removedPageId of packet.removedPages) {
            UIManager.removePage(removedPageId);
        }
        for (let updatedPage of packet.updatedPages) {
            let page = UIManager.getPage(updatedPage.pageId);
            let group = UIManager.getPageGroup(updatedPage.groupId);
            if (group != null) {
                page.setGroup(group);
            }
            page.setName(updatedPage.pageName);
            page.setIcon(updatedPage.pageIcon);
        }
        UIManager.requestPage(null, null);
        UIManager.hideUILoader();
    }
    /**
     * A handler method for the packet {@link ServerChangePagePacket}.
     * @param {ServerChangePagePacket} packet the packet
     */
    onChangePage(packet) {
        UIManager.setSelectedPage(packet.pageId);
    }
    /**
     * A handler method for the packet {@link ServerUpdatePagePacket}.
     * @param {ServerUpdatePagePacket} packet the packet
     */
    onUpdatePage(packet) {
        UIManager.updatePageData(packet);
    }
}
Hibiscus.init();