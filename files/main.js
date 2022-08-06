const CORE_URL = "http://hibiscus-player.ddns.net";
const DEFAULT_SERVER_URL = "ws://localhost/websocket";

const CurrentUserData = {
    _username: null,
    _user_icon_url: null,
    _user_token: null,

    _username_holder: null,
    _user_icon_holder: null,
    _init: false,
    _isMobile: false,
    _last_server_key: null,
    _serverName: null,
    _serverMotd: null,
    init() {
        this._init = true;
        this._isMobile = /Mobi/i.test(window.navigator.userAgent);
        this._username_holder = document.querySelector("#self_user_data #user_name");
        this._user_icon_holder = document.querySelector("#self_user_data #user_icon");
        this.queryUserData();
    },
    queryUserData() {
        //TODO make this work lmao
        if (window.firebaseData.isLoggedIn()) {
            this.setUsername(window.firebaseData.firebaseAuth.currentUser.displayName);
            this.setUserIconUrl(window.firebaseData.firebaseAuth.currentUser.photoURL);
            document.getElementById("login_google_btn").remove()
        } else {
            this.setUsername("Guest");
            this.setUserIconUrl("ui/guest.svg")
        }
    },
    setUsername(username) {
        this._username = username;
        this._username_holder.innerText = username;
    },
    setUserIconUrl(iconUrl) {
        this._user_icon_url = iconUrl;
        this._user_icon_holder.src = iconUrl;
    },
    getUserName() {
        return this._username;
    },
    getUserIconUrl() {
        return this._user_icon_url;
    },
    setServerData(serverName, serverMotd) {
        this._serverName = serverName;
        this._serverMotd = serverMotd;
    },
    isGuest() {
        return !window.firebaseData.isLoggedIn();
    },
    isMobile() {
        return this._isMobile;
    },
    getProfileId() {
        return window.firebaseData.firebaseAuth.currentUser.uid;
    },
    async performIdentityCheck(serverKey) {
        this._last_server_key = serverKey;

        let resolve;
        let reject;
        let promise = new Promise((resolved, rejected)=>{
            resolve = resolved;
            reject = rejected;
        });
        let xhr = new XMLHttpRequest();
        xhr.open("POST", CORE_URL + "/api/v1/joinServer");
        xhr.setRequestHeader("Authorization", window.firebaseData.firebaseAuth.currentUser.accessToken);
        xhr.setRequestHeader("X-Server-Key", serverKey);
        xhr.onerror = (e)=>{
            reject(e);
        };
        xhr.onload = ()=>{
            if (xhr.status == 200) resolve(JSON.parse(xhr.responseText));
            else reject(null);
        }
        xhr.send();
        return promise;
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
const Connection = {
    _websocket: null,
    _handler: null,
    _connected: false,
    async _connect(address) {
        if (this._handler == null) throw new Error("Cannot connect without a handler set.");
        if (this._websocket != null) this.disconnect();
        this._websocket = new WebSocket(address);
        this._websocket.binaryType = "arraybuffer";
        this._websocket.onopen = (_) => {
            this._connected = true;
            this._handler.onJoin();
            //resolve();
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
            //reject(e);
            this._handler.onConnectionFail();
            this._handler = null;
            this._websocket = null;
            this._connected = false;
        }
    },
    async login(address) {
        this._handler = new MainHandler();
        this._connect(address);
    },
    async ping(address) {
        let resolve;
        let reject;
        let promise = new Promise((resolved, rejected)=>{
            resolve = resolved;
            reject = rejected;
        });
        this._handler = new PingHandler(resolve, reject);
        this._connect(address);
        return promise;
    },
    disconnect() {
        if (this.isConnected()) {
            this._handler.onDisconnect();
            this._handler = null;
            this._websocket.close();
            this._websocket = null;
        }
    },
    isConnected() {
        return this._websocket != null;
    },
    sendPacket(packet) {
        if (!this._connected) return;
        this._websocket.send(packet.compress());
    }
}
const ServerData = {

}
class PingHandler extends PacketHandler {
    _resolve;
    _reject;

    _serverName;
    _serverMotd;
    _ping;
    constructor (resolve, reject) {
        super();
        this._resolve = resolve;
        this._reject = reject;
    }

    onJoin() {
        let userFlags = 0;
        userFlags|=ClientHelloPacket.IS_WEB_VERSION_BIT;
        let profileId = null;
        if (CurrentUserData.isMobile()) userFlags|=ClientHelloPacket.IS_MOBILE_BIT;
        if (CurrentUserData.isGuest()) {
            userFlags|=ClientHelloPacket.IS_GUEST_BIT;
        } else {
            profileId = CurrentUserData.getProfileId();
        }
        Connection.sendPacket(new ClientHelloPacket(userFlags, profileId));
    }
    onDisconnect() {

    }
    onConnectionTerminate(error) {
        this._reject({
            error: "terminated",
            code: error.code
        });
    }
    onConnectionFail(error) {
        this._reject({
            error: "failed"
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
        Connection.sendPacket(new ClientPingPacket(this._ping));
    }
    /**
     * A handler method for the packet {@link ServerKickPacket}.
     * @param {ServerKickPacket} packet the packet
     */
    onKick(packet) {
        this._reject({
            error: "kicked",
            kickReason: packet.kickReason
        });
    }
    /**
     * A handler method for the packet {@link ServerPongPacket}.
     * @param {ServerPongPacket} packet the packet
     */
    onPong(packet) {
        if (packet.data == BigInt(this._ping)) {
            let now = Date.now();
            let actualPing = now - this._ping;
            this._resolve({
                ping: actualPing,
                serverName: this._serverName,
                serverMotd: this._serverMotd
            });
            Connection.disconnect();
        }
    }
}
class MainHandler extends PacketHandler {
    constructor() {
        super();
    }
    onJoin() {
        let userFlags = ClientHelloPacket.IS_LOGIN_BIT;
        userFlags|=ClientHelloPacket.IS_WEB_VERSION_BIT;
        let profileId = null;
        if (CurrentUserData.isMobile()) userFlags|=ClientHelloPacket.IS_MOBILE_BIT;
        if (CurrentUserData.isGuest()) {
            userFlags|=ClientHelloPacket.IS_GUEST_BIT;
        } else {
            profileId = CurrentUserData.getProfileId();
        }
        Connection.sendPacket(new ClientHelloPacket(userFlags, profileId));
    }
    /**
     * A handler method for the packet {@link ServerHelloPacket}.
     * @param {ServerHelloPacket} packet the packet
     */
    onHello(packet) {
        CurrentUserData.setServerData(packet.serverName, packet.serverMotd);
    }
    /**
     * A handler method for the packet {@link ServerIdentityRequestPacket}.
     * @param {ServerIdentityRequestPacket} packet the packet
     */
    onIdentityRequest(packet) {
        console.log("Performing identity check as " + CurrentUserData.getProfileId() + "...");
        CurrentUserData.performIdentityCheck(packet.serverKey)
            .then((result)=>{
                console.log("Completed identity check.");
                Connection.sendPacket(new ClientIdentityCompletePacket());
            })
            .catch((error)=>{
                Connection.disconnect();
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

CurrentUserData.init();
setTimeout(()=>{
    CurrentUserData.queryUserData();
    UIManager._init();
    if (DEFAULT_SERVER_URL != null) Connection.login(DEFAULT_SERVER_URL);
}, 500);