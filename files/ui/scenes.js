class SceneManager {
    /**
     * The server selector scene.
     * @type {SelectorScene}
     */
    _selectorScene;
    /**
     * The main server scene.
     * @type {ServerScene}
     */
    _serverScene;

    /**
     * The currently selected scene.
     * @type {Scene}
     */
    _selectedScene;
    constructor() {
        this._selectorScene = new SelectorScene(document.querySelector("scene#selector"));
        this._serverScene = new ServerScene(document.querySelector("scene#server"));
        
        this._selectedScene = this._selectorScene;
        window.onresize = ()=>{
            this._selectedScene.onResize();
        };
        window.onkeyup = (e)=>{
            this._selectedScene.onKeyUp(e);
        }
    }
    getSelectorScene() {
        return this._selectorScene;
    }
    getServerScene() {
        return this._serverScene;
    }
    getSelectedScene() {
        return this._selectedScene;
    }
    /**
     * Selects the specified Scene.
     * @param {Scene} scene the scene to select
     */
    selectScene(scene) {
        this._selectedScene.setSceneVisible(false);
        this._selectedScene = scene;
        scene.setSceneVisible(true);
    }
}
class Scene {
    /**
     * The root scene element.
     * @type {HTMLElement}
     */
    _sceneRoot;
    /**
     * Creates a new Scene object.
     * @param {HTMLElement} sceneRoot the scene root element
     */
    constructor(sceneRoot) {
        this._sceneRoot = sceneRoot;
    }
    /**
     * Sets the scene visibility to the specified value.
     * @param {boolean} value the new value
     */
    setSceneVisible(value) {
        if (value) {
            this._sceneRoot.style.display = "";
        } else {
            this._sceneRoot.style.display = "none";
        }
    }
    getSceneRoot() {
        return this._sceneRoot;
    }
    onResize() {}
    /**
     * Handles a keyboard up event.
     * @param {KeyboardEvent} event the keyboard event
     */
    onKeyUp(event) {}
}
class SelectorScene extends Scene {
    _loader;
    _userObject;
    _userDataObject;
    _userSeparatorObject;
    _userButtonsObject;
    _signInButtonsObject;
    _accountButtonsObject;
    _selectedLogin;

    _editorObject;
    _editorTitleObject;
    /**
     * The address input field.
     * @type {HTMLInputElement}
     */
    _editorAddressInput;
    _editorCompleteButtonObject;
    _editorCloseButtonObject;
    /**
     * The current editor LazyPromise object, or null if
     * the editor is not open currently.
     * @type {LazyPromise|null}
     */
    _editorPromise;

    /**
     * Creates a new SelectorScene object.
     * @param {HTMLElement} sceneRoot the scene root element
     */
    constructor(sceneRoot) {
        super(sceneRoot);
        this._loader = this._sceneRoot.querySelector("#selector_body_loader");

        this._userObject = this._sceneRoot.querySelector("#selector_user");
        this._userDataObject = this._sceneRoot.querySelector("#selector_user_data");
        this._userSeparatorObject = this._sceneRoot.querySelector("#selector_user_separator");
        this._userButtonsObject = this._sceneRoot.querySelector("#selector_user_buttons");
        // Sign-in Buttons
        this._signInButtonsObject = this._sceneRoot.querySelector("#signin_buttons");
        let google = this._signInButtonsObject.querySelector("#signin_google");
        google.onclick = ()=>{
            this._startLogin(google);
        };
        // Account Buttons
        this._accountButtonsObject = this._sceneRoot.querySelector("#account_buttons");
        let signout = this._accountButtonsObject.querySelector("#signout");
        signout.onclick = ()=>{
            firebaseData.firebaseAuth.signOut();
        };

        this._editorObject = this._sceneRoot.querySelector("#selector_editor");
        this._editorTitleObject = this._sceneRoot.querySelector("#selector_editor_title");
        this._editorAddressInput = this._sceneRoot.querySelector("#selector_editor_address");
        this._editorCompleteButtonObject = this._sceneRoot.querySelector("#selector_editor_complete_button");
        this._editorCompleteButtonObject.onclick = ()=>{
            this._completeEditor();
        };
        this._editorCloseButtonObject = this._sceneRoot.querySelector("#selector_editor_close_button");
        this._editorCloseButtonObject.onclick = ()=>{
            this._cancelEditor("closed with X");
        };
    }
    /**
     * Opens the server editor.
     * @param {string} title the title of the editor
     * @param {string} address the default input value of the address field
     * @returns {Promise<{address: string}>} the edit result
     */
    async openServerEditor(title, address, completeButtonText) {
        if (this._isEditorOpen()) {
            return Promise.reject("Editor already open.");
        }
        this._editorPromise = new LazyPromise();
        
        this._editorTitleObject.textContent = title;
        this._editorAddressInput.value = address;
        this._editorCompleteButtonObject.textContent = completeButtonText;

        this._editorObject.style.display = "";
        setTimeout(()=>{
            this._editorObject.style.opacity = "";
            this._editorAddressInput.focus();
        }, 1);
        return this._editorPromise.getPromise();
    }
    _isEditorOpen() {
        return this._editorPromise != null;
    }
    _completeEditor() {
        if (!this._isEditorOpen()) return;
        this._editorPromise.resolve({
            address: this._editorAddressInput.value
        });
        this._finishEditor();
    }
    _cancelEditor(reason) {
        if (!this._isEditorOpen()) return;
        this._editorPromise.reject(reason);
        this._finishEditor();
    }
    _finishEditor() {
        this._editorObject.style.opacity = "0";
        this._editorPromise = null;
        setTimeout(()=>{
            this._editorObject.style.display = "none";
        }, 200);
    }
    _startLogin(selectedLogin) {
        if (this._selectedLogin != null) return;
        this._selectedLogin = selectedLogin;
        this._selectedLogin.classList.add("signin_loading");
        for (let login of this._signInButtonsObject.children) {
            console.log(login);
            console.log(this._selectedLogin != login);
            if (this._selectedLogin != login) {
                login.classList.add("signin_disabled");
            }
        }
        firebaseData.loginGoogle(()=>this._endLogin());
    }
    _endLogin() {
        this._selectedLogin.classList.remove("signin_loading");
        for (let login of this._signInButtonsObject.children) {
            login.classList.remove("signin_disabled");
        }
        this._selectedLogin = null;
    }
    /**
     * Sets the loader visibility to the specified value.
     * @param {boolean} value the new value
     */
    setLoaderVisible(value) {
        if (value) {
            this._loader.style.opacity = "";
        } else {
            this._loader.style.opacity = "0";
            setTimeout(()=>{
                this._loader.style.display = "none";
            }, 500);
        }
    }
    setSignedIn(value) {
        if (value) {
            this._signInButtonsObject.style.display = "none";
            this._accountButtonsObject.style.display = "";
        } else {
            this._signInButtonsObject.style.display = "";
            this._accountButtonsObject.style.display = "none";
        }
        this.checkSize();
    }
    onResize() {
        this.checkSize();
    }
    /**
     * Handles a keyboard up event.
     * @param {KeyboardEvent} event the keyboard event
     */
    onKeyUp(event) {
        if (this._isEditorOpen()) {
            if (event.key == "Escape") {
                this._cancelEditor("closed with ESC");
            } else if (event.key == "Enter") {
                this._completeEditor();
            }
        }
    }
    checkSize() {
        let sum = this._userDataObject.clientWidth + this._userButtonsObject.clientWidth + 40;
        if (this._userObject.clientWidth > sum) {
            this._userObject.classList.remove("vertical");
        } else {
            this._userObject.classList.add("vertical");
        }
    }
}
class ServerScene extends Scene {
    _installDesktopObject;
    /**
     * Creates a new ServerScene object.
     * @param {HTMLElement} sceneRoot the scene root element
     */
    constructor(sceneRoot) {
        super(sceneRoot);
        this._installDesktopObject = this._sceneRoot.querySelector("#install_desktop");
    }
    setInstallDesktop(value) {
        if (value) {
            this._installDesktopObject.style.display = "";
        } else {
            this._installDesktopObject.style.display = "none";
        }
    }
}