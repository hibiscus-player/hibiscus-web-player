class UIComponent {
    _componentID;
    _properties;
    _rootObject;
    constructor(componentID) {
        this._componentID = componentID;
        this._properties = [];
        this._rootObject = document.createElement("component");
        this._rootObject.classList.add(this.getComponentType());
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
}
class TitleBoxComponent extends UIComponent {
    static COMPONENT_TYPE = "title_box";
    titleText;
    titleFader;
    titleObject;
    color;
    constructor(componentID) {
        super(componentID);
        this.titleObject = document.createElement("span");
        this.titleObject.innerText = "Title";
        this.titleFader = new FadingTextChanger(this.titleObject);
        this._rootObject.appendChild(this.titleObject);

        this.titleText = this._stringProperty("Title", (value)=>{
            this.titleObject.innerText = value;
        });
        this.color = this._themeColorProperty("var(--background)", (value)=>{
            this._rootObject.style.backgroundColor = value;
        });
    }
    getComponentType() {
        return TitleBoxComponent.COMPONENT_TYPE;
    }
}
class TextBoxComponent extends UIComponent {
    static COMPONENT_TYPE = "text_box";
    text;
    textFader;
    textObject;
    color;
    constructor(componentID) {
        super(componentID);
        this.textObject = document.createElement("span");
        this.textObject.innerText = "Example Text";
        this.titleFader = new FadingTextChanger(this.textObject);
        this._rootObject.appendChild(this.textObject);

        this.text = this._stringProperty("Example text", (value)=>{
            while (this.textObject.firstChild) this.textObject.removeChild(this.textObject.lastChild);
            Markdown.render(this.textObject, Markdown.tokenize(value));
        });
        this.color = this._themeColorProperty("var(--background)", (value)=>{
            this._rootObject.style.backgroundColor = value;
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
    constructor(componentID) {
        super(componentID);
        this.buttonObject = document.createElement("span");
        this._rootObject.classList.add("btn");
        this.buttonObject.innerText = "Button";
        this.buttonTextFader = new FadingTextChanger(this.buttonObject);
        this._rootObject.appendChild(this.buttonObject);

        this.buttonText = this._stringProperty("Button", (value)=>{
            this.buttonObject.innerText = value;
        });
        this.color = this._themeColorProperty("var(--primary)", (value)=>{
            this._rootObject.style.backgroundColor = value;
        });
        
        this._rootObject.onclick = (e)=>{
            Connection.sendPacket(new ClientPageActionPacket(this.getComponentID(), 0, 0, null));
        };
    }
    getComponentType() {
        return ButtonComponent.COMPONENT_TYPE;
    }
}