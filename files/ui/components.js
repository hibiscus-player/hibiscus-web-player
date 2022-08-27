class UIComponent {
    /**
     * The id of this component.
     * @type {number}
     */
    _componentID;
    /**
     * The properties of this component.
     * @type {Array<UIProperty>}
     */
    _properties;
    /**
     * The root object of this component.
     * @type {HTMLElement}
     */
    _rootObject;
    /**
     * The client action list.
     * @type {Array<ClientAction>}
     */
    _clientActions;
    /**
     * The server action list.
     * @type {Array<ServerAction>}
     */
    _serverActions;
    constructor(componentID) {
        this._componentID = componentID;
        this._properties = [];
        this._rootObject = document.createElement("component");
        this._rootObject.classList.add(this.getComponentType());
        this._clientActions = [];
        this._serverActions = [];
    }
    getComponentType() {
        return "";
    }
    getRootObject() {
        return this._rootObject;
    }
    getComponentID() {
        return this._componentID;
    }
    /**
     * Returns a property from this component.
     * @param {number} id the ID of the property to get
     * @returns {UIProperty | null} the UIProperty if found, `null` otherwise
     */
    getProperty(id) {
        return this._properties[id];
    }
    _booleanProperty(defaultValue, changeHandler) {
        let prop = new BooleanProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _byteLengthStringProperty(defaultValue, changeHandler) {
        let prop = new ByteLengthStringProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _byteProperty(defaultValue, changeHandler) {
        let prop = new ByteProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _colorProperty(defaultValue, changeHandler) {
        let prop = new ColorProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _enumProperty(defaultValue, values, changeHandler) {
        let prop = new EnumProperty(this._properties.length, defaultValue, changeHandler, values);
        this._properties.push(prop);
        return prop;
    }
    _floatProperty(defaultValue, changeHandler) {
        let prop = new FloatProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _integerProperty(defaultValue, changeHandler) {
        let prop = new IntegerProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _shortLengthStringProperty(defaultValue, changeHandler) {
        let prop = new ShortLengthStringProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _shortProperty(defaultValue, changeHandler) {
        let prop = new ShortProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _stringProperty(defaultValue, changeHandler) {
        let prop = new StringProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }
    _themeColorProperty(defaultValue, changeHandler) {
        let prop = new ThemeColorProperty(this._properties.length, defaultValue, changeHandler);
        this._properties.push(prop);
        return prop;
    }

    voidClientAction() {
        let action = new VoidClientAction(this, this._clientActions.length);
        this._clientActions.push(action);
        return action;
    }
    stringClientAction() {
        let action = new StringClientAction(this, this._clientActions.length);
        this._clientActions.push(action);
        return action;
    }

    getServerAction(id) {
        return this._serverActions[id];
    }
    /**
     * @param {null|(value:*)=>void} handler an optional handler to use 
     */
    voidServerAction(handler=null) {
        let action = new VoidServerAction(this._serverActions.length, handler);
        this._serverActions.push(action);
        return action;
    }
    /**
     * @param {null|(value:*)=>void} handler an optional handler to use 
     */
    stringServerAction(handler=null) {
        let action = new StringServerAction(this._serverActions.length, handler);
        this._serverActions.push(action);
        return action;
    }
}
class TitleBoxComponent extends UIComponent {
    static COMPONENT_TYPE = "title_box";
    titleText;
    titleFader;
    titleObject;

    subtitleText;
    subtitleFader;
    subtitleObject;

    allFader;

    color;
    textAlignment;
    constructor(componentID) {
        super(componentID);
        this.titleObject = document.createElement("span");
        this.titleObject.innerText = "Title";
        this.titleObject.classList.add("title");
        this.titleFader = new FadingTextChanger(this.titleObject);
        this._rootObject.appendChild(this.titleObject);

        this.subtitleObject = document.createElement("span");
        this.subtitleObject.innerText = "Subtitle";
        this.subtitleObject.classList.add("subtitle");
        this.subtitleFader = new FadingTextChanger(this.subtitleObject);
        this._rootObject.appendChild(this.subtitleObject);

        this.allFader = new FadingTextChanger(this._rootObject, 200, ()=>{});

        this.titleText = this._stringProperty(null, (oldValue, newValue)=>{
            if (oldValue === undefined) this.titleObject.textContent = oldValue;
            else if (newValue != null) this.titleFader.changeTo(newValue);
            else this.titleFader.changeTo("");
        });
        this.subtitleText = this._stringProperty(null, (oldValue, newValue)=>{
            if (oldValue === undefined) this.subtitleObject.textContent = oldValue;
            else if (newValue != null) this.subtitleFader.changeTo(newValue);
            else this.subtitleFader.changeTo("");
        });
        this.color = this._themeColorProperty("var(--background)", (oldValue, newValue)=>{
            this._rootObject.style.backgroundColor = newValue;
        });
        this.textAlignment = this._enumProperty(undefined, TitleBoxComponent.TextAlignment.VALUES, (oldValue, newValue)=>{
            if (oldValue === undefined) {
                if (oldValue != null) {
                    oldValue.remove(this._rootObject);
                }
                if (newValue != null) {
                    newValue.apply(this._rootObject);
                }
            } else if (oldValue != newValue) {
                this.titleFader.blink();
                this.subtitleFader.blink();
                setTimeout(()=>{
                    if (oldValue != null) {
                        oldValue.remove(this._rootObject);
                    }
                    if (newValue != null) {
                        newValue.apply(this._rootObject);
                    }
                }, 200);
            }
        });
    }
    getComponentType() {
        return TitleBoxComponent.COMPONENT_TYPE;
    }
    static TextAlignment = class {
        static LEFT = new this("left_aligned");
        static CENTER = new this("center_aligned");
        static RIGHT = new this("right_aligned");
        static VALUES = [this.LEFT, this.CENTER, this.RIGHT];
        _classToAdd;
        constructor(classToAdd) {
            this._classToAdd = classToAdd;
        }
        apply(element) {
            element.classList.add(this._classToAdd);
        }
        remove(element) {
            element.classList.remove(this._classToAdd);
        }
    }
}
class TextBoxComponent extends UIComponent {
    static COMPONENT_TYPE = "text_box";
    text;
    textFader;
    color;
    constructor(componentID) {
        super(componentID);
        this.textFader = new FadingOpacityChanger(this._rootObject, (value)=>{
            this._rootObject.textContent = "";
            while (this._rootObject.firstChild) this._rootObject.removeChild(this._rootObject.lastChild);
            Markdown.render(this._rootObject, Markdown.tokenize(value));
        });

        this.text = this._stringProperty(null, (oldValue, newValue)=>{
            if (oldValue === undefined) this._rootObject.textContent = oldValue;
            else if (newValue != null) this.textFader.changeTo(newValue);
            else this.textFader.changeTo("");
        });
        this.color = this._themeColorProperty("var(--background)", (oldValue, newValue)=>{
            this._rootObject.style.backgroundColor = newValue;
        });
    }
    getComponentType() {
        return TextBoxComponent.COMPONENT_TYPE;
    }
}
class ButtonComponent extends UIComponent {
    static COMPONENT_TYPE = "button";
    buttonText;
    buttonTextFader;
    buttonObject;
    color;
    onclick;
    constructor(componentID) {
        super(componentID);
        this.buttonObject = document.createElement("span");
        this._rootObject.classList.add("btn");
        this.buttonObject.innerText = "Button";
        this.buttonTextFader = new FadingTextChanger(this.buttonObject);
        this._rootObject.appendChild(this.buttonObject);

        this.buttonText = this._stringProperty("Button", (oldValue, newValue)=>{
            this.buttonTextFader.changeTo(newValue);
        });
        this.color = this._themeColorProperty("var(--primary)", (oldValue, newValue)=>{
            this._rootObject.style.backgroundColor = newValue;
        });
        
        this.onclick = this.voidClientAction();
        this._rootObject.onclick = (e)=>{
            this.onclick.send();
        };
    }
    getComponentType() {
        return ButtonComponent.COMPONENT_TYPE;
    }
}
class TextInputComponent extends UIComponent {
    static COMPONENT_TYPE = "text_input";
    textObject;

    defaultValue;
    updateEvents;
    typeTimeoutId;

    oninputchange;
    constructor(componentID) {
        super(componentID);
        this.textObject = document.createElement("input");
        this.textObject.type = "text";
        this.textObject.classList.add("textInput");
        this.textObject.innerText = "Button";
        this.textObject.oninput = (e)=>{
            this._oninput();
        };
        this._rootObject.appendChild(this.textObject);

        this.typeTimeoutId = null;
        this.textObject.onkeyup = (e)=>{
            if (e.key == "Enter") {
                if (this.updateEvents.getValue() != TextInputComponent.UpdateEventType.EVERY_KEY) {
                    this._sendUpdate();
                }
            }
        };
        this.textObject.onblur = (e)=>{
            if (this.updateEvents.getValue() != TextInputComponent.UpdateEventType.EVERY_KEY) {
                this._sendUpdate();
            }
        };
        this.defaultValue = this._stringProperty("", (oldValue, newValue) => {
            if (oldValue == null) this.textObject.value = newValue;
        });
        this.updateEvents = this._enumProperty(TextInputComponent.UpdateEventType.AFTER_CHANGE, TextInputComponent.UpdateEventType.VALUES, (oldValue, newValue)=>{});
        
        this.oninputchange = this.stringClientAction();
    }
    _queueTimeout() {
        if (this.typeTimeoutId != null) clearTimeout(this.typeTimeoutId);
        this.typeTimeoutId = setTimeout(this._sendUpdate, 1000);
    }
    _sendUpdate() {
        if (this.typeTimeoutId != null) clearTimeout(this.typeTimeoutId);
        this.oninputchange.send(this.textObject.value);
    }
    _oninput() {
        if (this.updateEvents.getValue() == TextInputComponent.UpdateEventType.EVERY_KEY) {
            this.oninputchange.send(this.textObject.value);
        } else if (this.updateEvents.getValue() == TextInputComponent.UpdateEventType.AFTER_CHANGE_TIMEOUT) {
            this._queueTimeout();
        }
    }
    getComponentType() {
        return TextInputComponent.COMPONENT_TYPE;
    }
    static UpdateEventType = class {
        static EVERY_KEY = new this();
        static AFTER_CHANGE = new this();
        static AFTER_CHANGE_TIMEOUT = new this();
        static VALUES = [this.EVERY_KEY, this.AFTER_CHANGE, this.AFTER_CHANGE_TIMEOUT];
        constructor() {}
    }
}