class UIProperty {
    _propertyId;
    _value;
    _changeHandler;
    constructor(propertyId, defaultValue, changeHandler) {
        this._propertyId = propertyId;
        this._changeHandler = changeHandler;
        this.setValue(defaultValue);
    }
    getPropertyId() {
        return this._propertyId;
    }
    deserialize(reader) {}
    deserializeAndSet(reader) {
        this.setValue(this.deserialize(reader));
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._changeHandler(this._value, value);
        this._value = value;
    }
}
class BooleanProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUint8() > 0;
    }
}
class ByteLengthStringProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUTF16BEString(reader.readUint8());
    }
}
class ByteProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUint8();
    }
}
class ColorProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        let alpha = reader.readUint8();
        if (alpha == 0) {
            // Built in colors
            reader.skip(1);
            let id = reader.readUint16();
            return ThemeColorProperty.get(id);
        } else {
            // RGB color
            let red = reader.readUint8();
            let green = reader.readUint8();
            let blue = reader.readUint8();
            return "rgba(" + red + ", " + green + ", " + blue + ", " + (alpha/255) + ")";
        }
    }
}
class EnumProperty extends UIProperty {
    _values;
    constructor(propertyId, defaultValue, changeHandler, values) {
        super(propertyId, defaultValue, changeHandler);
        this._values = values;
    }
    deserialize(reader) {
        let ordinal;
        if (this._values.length < 256) {
            ordinal = reader.readUint8();
        } else if (this._values.length < 65536) {
            ordinal = reader.readUint16();
        } else {
            ordinal = reader.readUint32();
        }
        if (ordinal == -1) return null;
        return this._values[ordinal];
    }
}
class FloatProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readFloat();
    }
}
class IntegerProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUint32();
    }
}
class ShortLengthStringProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUTF16BEString(reader.readUint16());
    }
}
class ShortProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUint16();
    }
}
class StringProperty extends UIProperty {
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        return reader.readUTF16BEString(reader.readUint32());
    }
}
class ThemeColorProperty extends UIProperty {
    static _BUILT_IN_COLORS = {
        0: "",
        1: "var(--colors_bright_red)",
        2: "var(--colors_bright_orange)",
        3: "var(--colors_bright_yellow)",
        4: "var(--colors_bright_green)",
        5: "var(--colors_bright_cyan)",
        6: "var(--colors_bright_blue)",
        7: "var(--colors_bright_purple)",
        8: "var(--colors_bright_magenta)",
        9: "var(--colors_bright_gray)",
            
        10: "var(--colors_dark_red)",
        11: "var(--colors_dark_orange)",
        12: "var(--colors_dark_yellow)",
        13: "var(--colors_dark_green)",
        14: "var(--colors_dark_cyan)",
        15: "var(--colors_dark_blue)",
        16: "var(--colors_dark_purple)",
        17: "var(--colors_dark_magenta)",
        18: "var(--colors_dark_gray)",

        19: "var(--background)",
        20: "var(--backgroundBrighter)",
        21: "var(--backgroundDarker)",
        22: "var(--backgroundEvenDarker)",
        23: "var(--primary)",
        24: "var(--secondary)",
        25: "var(--text)",
    };
    static get(id) {
        if (!ThemeColorProperty._BUILT_IN_COLORS.hasOwnProperty(id)) return "";
        else return ThemeColorProperty._BUILT_IN_COLORS[id];
    }
    constructor(propertyId, defaultValue, changeHandler) {
        super(propertyId, defaultValue, changeHandler);
    }
    deserialize(reader) {
        let id = reader.readUint16();
        return ThemeColorProperty.get(id);
    }
}