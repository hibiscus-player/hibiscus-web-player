const Markdown = {
    escapeChar: "\\",
    escapable: ["\\", "\"", "\'", "*", "~", "_", "[", "]", "(", ")"],
    rawUrlRegex: /((\S*?):\/\/\S*?)(\s|$|\))/,
    maskedUrlRegex: /\]\(((\S*?):\/\/\S*?)\)/,
    validProtocols: ["http", "https"],
    linkCheck(link, masked) {
        return true;
    },
    render(root, tokens) {
        for (let token of tokens) {
            root.appendChild(token.render());
        }
    },
    tokenize(content) {
        let state = {
            ["***"]: {startToken: null},
            ["**"]: {startToken: null},
            ["*"]: {startToken: null},
            ["__"]: {startToken: null},
            ["_"]: {startToken: null},
            ["~~"]: {startToken: null},
            ["linkMasked"]: {startToken: null},
            ["h1"]: {startToken: null},
        };
        let tokens = [];
        let escapes = 0;
        let char;
        let currentText = null;
        for (let index = 0; index < content.length; index++) {
            char = content.charAt(index);
            if (char == this.escapeChar) {
                escapes++;
                if ((escapes % 2) == 0) {
                    if (currentText == null) {
                        currentText = new this.TextToken();
                        tokens.push(currentText);
                    }
                    currentText.textContent += char;
                }
            } else {
                if ((escapes % 2) == 0) {
                    let foundToken = false;
                    if (content.startsWith("***", index)) {
                        if (state["***"].startToken != null && state["***"].startToken.valid) {
                            // Clear start token
                            let startIndex = tokens.indexOf(state["***"].startToken);
                            state["***"].startToken.complete = true;
                            state["***"].startToken = null;
                            // Create completed token
                            let complete = new this.TripleStarToken();
                            complete.children = tokens.splice(startIndex, tokens.length-startIndex);
                            // Append new end token to children
                            complete.children.push(new this.HiddenToken("***", true));

                            this.invalidateIncompleteTokens(complete.children);
                            tokens.push(complete);
                        } else {
                            let startToken = new this.HiddenToken("***");
                            state["***"].startToken = startToken;
                            tokens.push(startToken);
                        }
                        index += 2;
                        foundToken = true;
                    } else if (content.startsWith("**", index)) {
                        if (state["**"].startToken != null && state["**"].startToken.valid) {
                            // Clear start token
                            let startIndex = tokens.indexOf(state["**"].startToken);
                            state["**"].startToken.complete = true;
                            state["**"].startToken = null;
                            // Create completed token
                            let complete = new this.DoubleStarToken();
                            complete.children = tokens.splice(startIndex, tokens.length-startIndex);
                            // Append new end token to children
                            complete.children.push(new this.HiddenToken("**", true));
                            
                            this.invalidateIncompleteTokens(complete.children);
                            tokens.push(complete);
                        } else {
                            let startToken = new this.HiddenToken("**");
                            state["**"].startToken = startToken;
                            tokens.push(startToken);
                        }
                        index += 1;
                        foundToken = true;
                    } else if (content.startsWith("*", index)) {
                        if (state["*"].startToken != null && state["*"].startToken.valid) {
                            // Clear start token
                            let startIndex = tokens.indexOf(state["*"].startToken);
                            state["*"].startToken.complete = true;
                            state["*"].startToken = null;
                            // Create completed token
                            let complete = new this.StarToken();
                            complete.children = tokens.splice(startIndex, tokens.length-startIndex);
                            // Append new end token to children
                            complete.children.push(new this.HiddenToken("*", true));
                            
                            this.invalidateIncompleteTokens(complete.children);
                            tokens.push(complete);
                        } else {
                            let startToken = new this.HiddenToken("*");
                            state["*"].startToken = startToken;
                            tokens.push(startToken);
                        }
                        foundToken = true;
                    } else if (content.startsWith("__", index)) {
                        if (state["__"].startToken != null && state["__"].startToken.valid) {
                            // Clear start token
                            let startIndex = tokens.indexOf(state["__"].startToken);
                            state["__"].startToken.complete = true;
                            state["__"].startToken = null;
                            // Create completed token
                            let complete = new this.DoubleUnderscoreToken();
                            complete.children = tokens.splice(startIndex, tokens.length-startIndex);
                            // Append new end token to children
                            complete.children.push(new this.HiddenToken("__", true));
                            
                            this.invalidateIncompleteTokens(complete.children);
                            tokens.push(complete);
                        } else {
                            let startToken = new this.HiddenToken("__");
                            state["__"].startToken = startToken;
                            tokens.push(startToken);
                        }
                        index += 1;
                        foundToken = true;
                    } else if (content.startsWith("_", index)) {
                        if (state["_"].startToken != null && state["_"].startToken.valid) {
                            // Clear start token
                            let startIndex = tokens.indexOf(state["_"].startToken);
                            state["_"].startToken.complete = true;
                            state["_"].startToken = null;
                            // Create completed token
                            let complete = new this.UnderscoreToken();
                            complete.children = tokens.splice(startIndex, tokens.length-startIndex);
                            // Append new end token to children
                            complete.children.push(new this.HiddenToken("_", true));
                            
                            this.invalidateIncompleteTokens(complete.children);
                            tokens.push(complete);
                        } else {
                            let startToken = new this.HiddenToken("_");
                            state["_"].startToken = startToken;
                            tokens.push(startToken);
                        }
                        foundToken = true;
                    } else if (content.startsWith("~~", index)) {
                        if (state["~~"].startToken != null && state["~~"].startToken.valid) {
                            // Clear start token
                            let startIndex = tokens.indexOf(state["~~"].startToken);
                            state["~~"].startToken.complete = true;
                            state["~~"].startToken = null;
                            // Create completed token
                            let complete = new this.DoubleTildeToken();
                            complete.children = tokens.splice(startIndex, tokens.length-startIndex);
                            // Append new end token to children
                            complete.children.push(new this.HiddenToken("~~", true));
                            
                            this.invalidateIncompleteTokens(complete.children);
                            tokens.push(complete);
                        } else {
                            let startToken = new this.HiddenToken("~~");
                            state["~~"].startToken = startToken;
                            tokens.push(startToken);
                        }
                        index += 1;
                        foundToken = true;
                    } else if (content.startsWith("[", index)) {
                        let startToken = new this.HiddenToken("[");
                        state["linkMasked"].startToken = startToken;
                        tokens.push(startToken);
                        foundToken = true;
                    } else if (content.startsWith("](", index)) {
                        if (state["linkMasked"].startToken != null && state["linkMasked"].startToken.valid) {
                            // Try matching URLs
                            let match = content.substring(index).match(this.maskedUrlRegex);
                            if (match != null && match.index == 0) {
                                // Found a link at the current position, check protocol
                                let protocol = match.at(2);
                                if (this.validProtocols.includes(protocol)) {
                                    // Clear start token
                                    let startIndex = tokens.indexOf(state["linkMasked"].startToken);
                                    state["linkMasked"].startToken.complete = true;
                                    state["linkMasked"].startToken = null;
                                    // Create completed token
                                    let complete = new this.MaskedLinkToken(match.at(1));
                                    complete.children = tokens.splice(startIndex, tokens.length-startIndex);

                                    this.invalidateIncompleteTokens(complete.children);
                                    tokens.push(complete);
                                    index += match.at(1).length + 2; // ](
                                    foundToken = true;
                                }
                            }
                        }
                    } else {
                        // Try matching URLs
                        let match = content.substring(index).match(this.rawUrlRegex);
                        if (match != null && match.index == 0) {
                            // Found a link at the current position, check protocol
                            let protocol = match.at(2);
                            if (this.validProtocols.includes(protocol)) {
                                console.log(match);
                                console.log(index);
                                console.log(content.substring(index));
                                // Create completed token
                                let complete = new this.RawLinkToken(match.at(1));
                                tokens.push(complete);
                                index += match.at(1).length - 1;
                                foundToken = true;
                            } else {
                                // Invalid protocol
                            }
                        } else {
                            // No URLs found
                        }
                    }
                    if (foundToken) {
                        currentText = null;
                        continue;
                    }
                }
                if (currentText == null) {
                    currentText = new this.TextToken();
                    tokens.push(currentText);
                }
                if (!this.escapable.includes(char) && (escapes % 2) == 1) {
                    //Not valid escapeable, display the escape char too
                    currentText.textContent += this.escapeChar;
                }
                currentText.textContent += char;
                escapes = 0;
            }
        }
        this.invalidateIncompleteTokens(tokens);
        return tokens;
    },
    removeToken(array, token) {
        delete array[array.indexOf(token)];
    },
    invalidateIncompleteTokens(array) {
        for (let i = 0; i < array.length; i++) {
            let token = array[i];
            if (token != undefined && !token.complete) {
                token.valid = false;
            }
        }
    },
    isEscaped(string, index) {
        let escaped = false;
        do {
            if (string.charAt(index-1) == this.escapeChar) {
                escaped = !escaped;
                index -= 1;
            } else return escaped;
        } while(index > 0);
        return escaped;
    }
};
Markdown.Token = class {
    complete;
    valid;
    textContent;
    children;
    constructor(textContent) {
        this.complete = false;
        this.valid = true;
        this.textContent = textContent;
        this.children = [];
    }
    render() {
        return this.renderText();
    }
    renderText() {
        return document.createTextNode(this.textContent);
    }
    renderChildren(root) {
        for (let child of this.children) {
            if (child == undefined) continue;
            root.appendChild(child.complete ? child.render() : child.renderText());
        }
    }
    renderRaw(root) {
        if (this.children.length == 0) return this.renderText();

        for (let child of this.children) {
            if (child == undefined) continue;
            root.appendChild(child.renderRaw(root));
        }
    }
};
Markdown.TextToken = class extends Markdown.Token {
    constructor() {
        super("");
        this.complete = true;
    }
};
Markdown.HiddenToken = class extends Markdown.Token {
    constructor(text, complete=false) {
        super(text);
        this.complete = complete;
    }
    render() {
        return this.complete ? document.createTextNode("") : this.renderText();
    }
};
Markdown.UnderscoreToken = class extends Markdown.Token {
    constructor() {
        super(undefined);
        this.complete = true;
    }
    render() {
        let mdt = document.createElement("mdt");
        mdt.classList.add("italic");
        this.renderChildren(mdt);
        return mdt;
    }
};
Markdown.DoubleUnderscoreToken = class extends Markdown.Token {
    constructor() {
        super(undefined);
        this.complete = true;
    }
    render() {
        let mdt = document.createElement("mdt");
        mdt.classList.add("underline");
        this.renderChildren(mdt);
        return mdt;
    }
};
Markdown.DoubleTildeToken = class extends Markdown.Token {
    constructor() {
        super(undefined);
        this.complete = true;
    }
    render() {
        let mdt = document.createElement("mdt");
        mdt.classList.add("strikethrough");
        this.renderChildren(mdt);
        return mdt;
    }
};
Markdown.StarToken = class extends Markdown.Token {
    constructor() {
        super(undefined);
        this.complete = true;
    }
    render() {
        let mdt = document.createElement("mdt");
        mdt.classList.add("italic");
        this.renderChildren(mdt);
        return mdt;
    }
};
Markdown.DoubleStarToken = class extends Markdown.Token {
    constructor() {
        super(undefined);
        this.complete = true;
    }
    render() {
        let mdt = document.createElement("mdt");
        mdt.classList.add("bold");
        this.renderChildren(mdt);
        return mdt;
    }
};
Markdown.TripleStarToken = class extends Markdown.Token {
    constructor() {
        super(undefined);
        this.complete = true;
    }
    render() {
        let mdt = document.createElement("mdt");
        mdt.classList.add("italicbold");
        this.renderChildren(mdt);
        return mdt;
    }
};
Markdown.RawLinkToken = class extends Markdown.Token {
    constructor(link) {
        super(link);
        this.complete = true;
    }
    render() {
        let a = document.createElement("a");
        a.classList.add("md-link");
        a.href = this.textContent;
        a.rel = "noopener noreferrer";
        a.target = "_blank";
        a.innerText = this.textContent;
        a.onclick = (e)=>{
            if (Markdown.linkCheck(link, false)) e.preventDefault();
        };
        return a;
    }
};
Markdown.MaskedLinkToken = class extends Markdown.Token {
    constructor(link) {
        super(link);
        this.complete = true;
    }
    render() {
        let a = document.createElement("a");
        a.classList.add("md-link");
        this.renderChildren(a);
        a.href = this.textContent;
        a.rel = "noopener noreferrer";
        a.target = "_blank";
        a.onclick = (e)=>{
            if (Markdown.linkCheck(link, true)) e.preventDefault();
        };
        return a;
    }
};