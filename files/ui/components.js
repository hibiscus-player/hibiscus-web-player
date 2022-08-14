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
        
        this._rootObject.onclick = (e)=>{
            Hibiscus.getCurrentServerConnection().sendPacket(new ClientPageActionPacket(this.getComponentID(), 0, 0, null));
        };
    }
    getComponentType() {
        return ButtonComponent.COMPONENT_TYPE;
    }
}