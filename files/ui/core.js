class FadingChanger {
    static STATE_READY = 0;
    static STATE_FADE_OUT = 1;
    static STATE_FADE_IN = 2;
    /**
     * The HTML object.
     * @type {HTMLElement}
     */
    _object;
    /**
     * The transition duration.
     * @type {number}
     */
    _fadeDuration

    /**
     * The current value.
     * If there is a fade going on,
     * then this is the previous value.
     * @type {*}
     */
    _currentValue;
    /**
     * The currently ongoing fade is targeting this.
     * @type {*}
     */
    _targetValue;
    /**
     * The current state of this fading text changer.
     * @type {number}
     */
    _state;
    
    constructor(object, fadeDuration=200) {
        this._object = object;
        this._fadeDuration = fadeDuration;
        this._currentValue = null;
        this._targetValue = null;
        this._state = FadingTextChanger.STATE_READY;
    }
    changeTo(newValue) {
        if (this._currentValue == null) {
            this.changeToFast(newValue);
            return;
        }
        if (this._state == FadingTextChanger.STATE_READY && this._currentValue == newValue) return;
        else if (this._targetValue == newValue) return;

        this._targetValue = newValue;
        if (this._state == FadingTextChanger.STATE_READY) this._doFade();
    }
    changeToFast(newValue) {
        this._currentValue = newValue;
        this._doSetValue(newValue);
    }
    _doFade() {
        this._state = FadingTextChanger.STATE_FADE_OUT;
        this._doFadeOut();
        setTimeout(()=>{
            this._state = FadingTextChanger.STATE_FADE_IN;
            this._currentValue = this._targetValue
            this._doSetValue(this._targetValue);
            this._targetValue = null;
            this._doFadeIn();
            setTimeout(()=>{
                if (this._targetValue == null) {
                    // No second transition needed
                    this._state = FadingTextChanger.STATE_READY;
                } else {
                    this._doFade();
                }
            }, this._fadeDuration);
        }, this._fadeDuration);
    }
    _doFadeOut() {}
    _doSetValue(newValue) {}
    _doFadeIn() {}
}
class FadingOpacityChanger extends FadingChanger {
    /**
     * The change listener.
     * @type {(newValue: *)=>void}
     */
    _onChange;
    /**
     * Creates a new FadingOpacityChanger.
     * @param {HTMLElement} object the html object
     * @param {(newValue: *)=>void} onChange a change listener
     * @param {number} fadeDuration the fade duration
     */
    constructor(object, onChange, fadeDuration) {
        super(object, fadeDuration);
        this._onChange = onChange;
    }
    _doFadeOut() {
        this._object.style.opacity = "0";
    }
    _doSetValue(newValue) {
        this._onChange(newValue);
    }
    _doFadeIn() {
        this._object.style.opacity = "";
    }
}
class FadingInvertedOpacityChanger extends FadingChanger {
    /**
     * The change listener.
     * @type {(newValue: *)=>void}
     */
    _onChange;
    /**
     * Creates a new FadingInvertedOpacityChanger.
     * @param {HTMLElement} object the html object
     * @param {(newValue: *)=>void} onChange a change listener
     * @param {number} fadeDuration the fade duration
     */
    constructor(object, onChange, fadeDuration) {
        super(object, fadeDuration);
        this._onChange = onChange;
    }
    _doFadeOut() {
        this._object.style.opacity = "";
    }
    _doSetValue(newValue) {
        this._onChange(newValue);
    }
    _doFadeIn() {
        this._object.style.opacity = "0";
    }
}

class FadingImageChanger extends FadingOpacityChanger {
    /**
     * Creates a new FadingImageChanger.
     * @param {HTMLImageElement} object the html object
     * @param {number} fadeDuration the fade duration
     */
    constructor(object, fadeDuration) {
        super(object, (newValue)=> {
            this._object.src = newValue;
        }, fadeDuration);
        object.onload = ()=>{object.style.opacity = "";}
        object.onerror = ()=>{object.style.opacity = "0";}
    }
}
class FadingTextChanger extends FadingChanger {
    constructor(object, fadeDuration) {
        super(object, fadeDuration);
    }
    _doFadeOut() {
        this._object.style.color = "#0000";
    }
    _doSetValue(newValue) {
        this._object.textContent = newValue;
    }
    _doFadeIn() {
        this._object.style.color = "";
    }
}
/**
 * A constant object responsible for managing the UI.
 */
const UIManager = {
    /**
     * The registry that maps the id of a Component to
     * a method which creates a new instance of this Component.
     * @type {Object.<string, (componentID: number) => UIComponent>}
     */
    _COMPONENT_TYPES: {},
    /**
     * The currently selected Page object.
     * If null, then the client has not yet selected a page object.
     * @type {UIPage|null}
     */
    _currentPageObject: null,
    /**
     * The currently selected Page's id.
     * If null, then the client has not yet selected a page object.
     * 
     * Note that this might differ from _currentPageObject.getID(), as
     * this includes potential page id parameters.
     * @type {string|null}
     * @private
     */
    _currentPageId: null,
    /**
     * The list of currently registered Page objects.
     * @type {Object.<string, UIPage>}
     * @private
     */
    _pages: {},
    /**
     * The list of currently registered PageGroup objects.
     * @type {Object.<string, PageGroup>}
     * @private
     */
    _pageGroups: {},
    /**
     * Contains the request page elements in order. This is used when there
     * are multiple pending page select requests, and is used to ignore the previous requests,
     * since only the final request should be accepted.
     * Note that if the server sends an unexpected page change, then this gets cleared,
     * and whatever the server sent is selected.
     * 
     * @type {Array<{page: UIPage, pageId: string}>}
     * @private
     */
    _requestPageHistory: [],

    /**
     * The navbar root element, containing the navbar entries.
     * @type {HTMLElement}
     * @private
     */
    _navbar: null,
    /**
     * The ui loader element. This is the loader object, that starts loading
     * when the client is connecting to the server initially. This is usually
     * never displayed again in a single session.
     * @type {HTMLElement}
     * @private
     */
    _uiLoader: null,
    /**
     * The page loader element. This is the loader object, that starts loading
     * when the client tries to switch pages. Note that this loader will still be
     * visible after successful page changes, until the first {@link ServerUpdatePagePacket}
     * is received. 
     * @type {HTMLElement}
     * @private
     */
    _pageLoader: null,
    /**
     * The page object element. This object contains all of the components that
     * the current page contains. The children get cleared when the server sends
     * a {@link ServerChangePagePacket}. 
     * @type {HTMLElement}
     * @private
     */
    _pageObject: null,
    /**
     * Initializes the UIManager.
     */
    _init() {
        // Initialize the HTML constant objects.
        this._navbar = document.getElementsByTagName("navbar")[0];
        this._uiLoader = document.getElementById("uiLoader");
        this._pageLoader = document.getElementById("pageLoader");
        this._pageObject = document.getElementById("mainPage");

        // Initialize the component registry
        this._COMPONENT_TYPES[TitleBoxComponent.COMPONENT_TYPE] = (componentId)=>new TitleBoxComponent(componentId);
        this._COMPONENT_TYPES[TextBoxComponent.COMPONENT_TYPE] = (componentId)=>new TextBoxComponent(componentId);
        this._COMPONENT_TYPES[ButtonComponent.COMPONENT_TYPE] = (componentId)=>new ButtonComponent(componentId);
    },
    /**
     * Shows the UI loading screen. This covers the page list
     * and the currently opened page.
     */
    showUILoader() {
        this._uiLoader.style.display = "";
        this._uiLoader.style.opacity = 1;
    },
    /**
     * Hides the UI loading screen. This covers the page list
     * and the currently opened page.
     */
    hideUILoader() {
        this._uiLoader.style.opacity = 0;
        setTimeout(()=>{
            this._uiLoader.style.display = "none";
        }, 500);
    },
    /**
     * Shows the page loading screen. This
     * covers the currently opened page.
     * @param {()=>void} action an optional action to run after the page loader is fully visible
     */
    showPageLoader(action=()=>{}) {
        this._pageLoader.style.display = "";
        this._pageLoader.style.opacity = 1;
        setTimeout(()=>{
            action();
        }, 500);
    },
    /**
     * Hides the page loading screen. This
     * covers the currently opened page.
     * @param {()=>void} action an optional action to run after the page loader is fully hidden
     */
    hidePageLoader(action=()=>{}) {
        this._pageLoader.style.opacity = 0;
        setTimeout(()=>{
            this._pageLoader.style.display = "none";
            action();
        }, 500);
    },
    /**
     * Requests a page from the server. If the requested page ID is null,
     * then the default page is requested from the server.
     * @param {UIPage} page the page object itself
     * @param {string} pageId the request page ID
     */
    requestPage(page, pageId) {
        if (page == null) {
            // Deselect the previously selected page
            if (this._currentPageObject != null) this._currentPageObject.deselect();
            console.log("Requesting default page");
            Hibiscus.getCurrentServerConnection().sendPacket(new ClientChangePagePacket(null));
        } else {
            // Don't request the current page again
            if (this._currentPageId == pageId) return;
            // Don't request the same page twice
            if (this._requestPageHistory.length > 0 && this._requestPageHistory[0].pageId == pageId) return;
            
            console.log("Requesting page \"" + pageId + "\"");
            
            // Deselect the previously selected page
            if (this._requestPageHistory.length > 0) {
                this._requestPageHistory[this._requestPageHistory.length - 1].page.deselect();
            } else {
                if (this._currentPageObject != null) this._currentPageObject.deselect();
            }
            page.select();
            this._requestPageHistory.push({page:page,pageId:pageId});
            this.showPageLoader(()=>{
                Hibiscus.getCurrentServerConnection().sendPacket(new ClientChangePagePacket(pageId));
            });
        }
    },
    /**
     * Sets the selected page to the specified page id.
     * This is usually called after receiving a {@link ServerChangePagePacket}.
     * @param {string} pageId
     */
    setSelectedPage(pageId) {
        let page;
        if (pageId.indexOf("/") > 0) {
            page = this._pages[pageId.split("/")[0]];
        } else {
            page = this._pages[pageId];
        }
        if (page != null) {
            if (this.currentPageId == pageId) {
                console.log("Cancelling page change");
                this.hidePageLoader();
                return;
            }
            if (this._requestPageHistory.length > 0 && this._requestPageHistory[0].page == page) {
                // Expected page change
                this._requestPageHistory.shift();
                console.log("Changing to \"" + pageId + "\"");
            } else {
                console.log("Forced change to \"" + pageId + "\"");
                this._requestPageHistory.length = 0;
                if (this._currentPageObject != null) this._currentPageObject.deselect();
                page.select();
            }

            this._currentPageId = pageId;
            this._currentPageObject = page;

            // Clear the page object
            while (this._pageObject.firstChild) {
                this._pageObject.removeChild(this._pageObject.lastChild);
            }
        } else {
            // Display no page error
            //TODO
            console.warn("UNKNOWN PAGE ERROR: " + pageId);
        }
    },
    /**
     * Returns an UIPage with the specified pageId, or `null` 
     * if it does not exist.
     * @param {string} pageId 
     * @returns {UIPage|null}
     */
    getPage(pageId) {
        return this._pages[pageId];
    },
    /**
     * Returns an UIPageGroup with the specified groupId, or `null` 
     * if it does not exist.
     * @param {string} groupId 
     * @returns {UIPageGroup|null}
     */
    getPageGroup(groupId) {
        return this._pageGroups[groupId];
    },
    /**
     * Registers a page group. This method makes
     * the page group visible in the navigation bar.
     * @param {UIPageGroup} pageGroup the page group to register
     */
    registerPageGroup(pageGroup) {
        this._pageGroups[pageGroup.getID()] = pageGroup;
        this._navbar.appendChild(pageGroup._navbarObject);
    },
    /**
     * Unregisters a page group. This method makes
     * the page group no longer visible in the navigation bar.
     * @param {UIPageGroup} pageGroup the page group to unregister
     */
    unregisterPageGroup(pageGroup) {
        delete this._pageGroups[pageGroup.getID()];
        this._navbar.removeChild(pageGroup._navbarObject);
    },
    /**
     * Registers a page.
     * @param {UIPage} page the page to register
     */
    registerPage(page) {
        this._pages[page.getID()] = page;
    },
    /**
     * Unregisters a page.
     * @param {UIPage} page the page to unregister
     */
    unregisterPage(page) {
        delete this._pages[page.getID()];
    },
    /**
     * Removes the page with the specified ID. This method
     * changes to the default page if it is the current page
     * that's being removed.
     * @param {string} pageId the id of the page to remove
     */
    removePage(pageId) {
        let page = this.getPage(pageId);
        if (page != null) {
            if (page == this._currentPageObject) {
                this.showPageLoader(()=>{
                    page.setGroup(null);
                    this.unregisterPage(page);
                    if (page == this._currentPage) {
                        page.deselect();
                        this._currentPage = null;
                        this.requestPage(null, null);
                    }
                });
            } else {
                page.getGroup().removePage(page);
                this.unregisterPage(page);
            }
        }
    },
    /**
     * Removes the page group with the specified ID. This method
     * changes to the default page if it is the current page
     * that's being removed.
     * @param {string} pageId the id of the page to remove
     */
    removePageGroup(groupId) {
        let pageGroup = this.getPageGroup(groupId);
        if (pageGroup != null) {
            pageGroup.remove();
        }
    },
    /**
     * Clears all data of the UIManager. This is used
     * to reset the state to the initial empty values
     * on connection changes.
     */
    clearData() {
        while (this._navbar.firstChild) this._navbar.lastChild.remove();
        this._currentPage = null,
        this._targetPage = null,
        this._pages = {};
        this._pageGroups = {};
        this._requestPageHistory = [];
    },
    /**
     * Updates the current page contents from the specified {@link ServerUpdatePagePacket}.
     * @param {ServerUpdatePagePacket} updatePagePacket the ServerUpdatePagePacket
     */
    updatePageData(updatePagePacket) {
        let reader = updatePagePacket.reader;
        for (let addData of updatePagePacket.addedComponents) {
            this._addComponent(reader, addData);
        }
        for (let componentID of updatePagePacket.removedComponents) {
            this._removeComponent(componentID);
        }
        for (let updateData of updatePagePacket.updatedProperties) {
            this._updateProperty(reader, updateData);
        }

        if (this._requestPageHistory.length == 0) {
            // We are not awaiting any more pages
            this.hidePageLoader();
        }
    },
    /**
     * Adds a component to the current page from the specified compressed data.
     * This method decompresses the data from the specified DataViewReader.
     * @param {DataViewReader} reader the reader to get data from
     * @param {{componentId: number, type: string, offset: number}} addData the data about the component
     */
    _addComponent(reader, addData) {
        if (!this._COMPONENT_TYPES.hasOwnProperty(addData.type)) {
            console.warn("Unknown component \"" + addData.type + "\" requested!");
        } else {
            reader.setOffset(addData.offset);
            let component = this._COMPONENT_TYPES[addData.type](addData.componentId);
            for (let property of component._properties) {
                property.deserializeAndSet(reader);
            }
            this._currentPageObject.addComponent(component);
            this._pageObject.appendChild(component.getRootObject());
        }
    },
    /**
     * Removes the component with the specified id from the current page.
     * @param {number} componentID the id of the component being removed
     */
    _removeComponent(componentID) {
        let component = this._currentPageObject.getComponent(componentID);
        this._currentPageObject.removeComponent(component);
        this._pageObject.removeChild(component.getRootObject());
    },
    /**
     * Updates a property of a component from the current page.
     * This method decompresses the data from the specified DataViewReader.
     * @param {DataViewReader} reader the reader to get data from
     * @param {{componentId: number, propertyId: number, offset: number}} updateData the data about the update
     */
    _updateProperty(reader, updateData) {
        let component = this._currentPageObject.getComponent(updateData.componentId);
        if (component == null) {
            console.warn("Failed to update unknown component with id " + updateData.componentId + "!");
            return;
        } else {
            let property = component.getProperty(updateData.propertyId);
            if (property == null) {
                console.warn("Failed to update unknown property with id " + updateData.propertyId + " on " + typeof(component) + "!");
                return;
            }
            reader.setOffset(updateData.offset);
            property.deserializeAndSet(reader);
        }
    }
};