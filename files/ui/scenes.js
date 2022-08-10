class SceneManager {
    /**
     * The server selector scene.
     * @type {SelectorScene}
     */
    _selectorScene;
    /**
     * The main server scene.
     * @type {Scene}
     */
    _serverScene;

    /**
     * The currently selected scene.
     * @type {Scene}
     */
    _selectedScene;
    constructor() {
        this._selectorScene = new SelectorScene(document.querySelector("scene#selector"));
        this._serverScene = new Scene(document.querySelector("scene#server"));
        
        this._selectedScene = this._selectorScene;
        window.onresize = ()=>{
            this._selectedScene.onResize();
        };
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
}
class SelectorScene extends Scene {
    _loader;
    _userObject;
    _userDataObject;
    _userSeparatorObject;
    _signInButtonsObject;
    _selectedLogin;

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
        this._signInButtonsObject = this._sceneRoot.querySelector("#signin_buttons");
        let google = this._signInButtonsObject.querySelector("#signin_google");
        google.onclick = ()=>{
            this._startLogin(google);
        };
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
        } else {
            this._signInButtonsObject.style.display = "";
        }
        this.checkSize();
    }
    onResize() {
        this.checkSize();
    }
    checkSize() {
        let sum = this._userDataObject.clientWidth + this._signInButtonsObject.clientWidth + 40;
        if (this._userObject.clientWidth > sum) {
            this._userObject.classList.remove("vertical");
        } else {
            this._userObject.classList.add("vertical");
        }
    }
}
class SignInButton {
    _object;
    _clickHandler;

}