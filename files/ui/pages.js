/**
 * Represents a page group that contains pages.
 * This class manages the navigation bar components
 * for this page group.
 */
 class UIPageGroup {
    /**
     * The ID of this page group.
     * @type {string}
     */
    _id;
    /**
     * The name of this page group.
     * @type {FadingTextChanger}
     */
    _name;
    /**
     * Whether this page group is collapsed or not.
     * @type {boolean}
     */
    _collapsed;
    /**
     * Represents the pages which are in this page group.
     * @type {Array<UIPage>}
     */
    _pages;

    /**
     * The HTML element in the navigation bar that represents the page group.
     * @type {HTMLElement}
     */
    _navbarObject;
    /**
     * The HTML element in the navigation bar that contains the name of the page group.
     * @type {HTMLElement}
     */
    _navbarHeader;
    /**
     * The HTML element in the navigation bar that contains the page elements.
     * @type {HTMLElement}
     */
    _navbarContents;
    constructor(id, name="Unnamed Group") {
        this._id = id;
        this._collapsed = false;
        this._pages = [];

        this._navbarObject = document.createElement("navbar_page_group");

        this._navbarHeader = document.createElement("navbar_page_group_header");
        this._navbarHeader.innerText = name;
        this._name = new FadingTextChanger(this._navbarHeader);
        this._navbarHeader.onclick = ()=>this.toggleCollapse();
        this._navbarObject.appendChild(this._navbarHeader);

        this._navbarContents = document.createElement("navbar_page_group_contents");
        this._navbarObject.appendChild(this._navbarContents);

        this.setCollapsed(false);
    }
    /**
     * Returns the id of this page group.
     * @returns {string} the page group id
     */
    getID() {
        return this._id;
    }
    /**
     * Sets the name of this page group to the specified string.
     * @param {string} name the new name
     */
    setName(name) {
        this._name.changeTo(name);
    }
    /**
     * Adds the specified UIPage to the list of contained pages.
     * If the page should be shown to the user, this method will
     * make the page appear on the navigation bar.
     * @param {UIPage} page the page to add
     */
    addPage(page) {
        if (this._pages.includes(page)) return;
        this._pages.push(page);
        this._navbarContents.appendChild(page._object);
        this.setCollapsed(this._collapsed); //refresh height
    }
    /**
     * Removes the specified UIPage from the list of contained pages.
     * If the page was visible to the user, then this method will
     * remove the page from the navigation bar.
     * @param {UIPage} page the page to remove
     */
    removePage(page) {
        if (!this._pages.includes(page)) return;
        this._pages.splice(this._pages.indexOf(page), 1);
        this._navbarContents.removeChild(page._object);
        this.setCollapsed(this._collapsed); //refresh height
    }
    /**
     * Toggles whether this page group is collasped or not.
     * This is a convenience method for {@link setCollapsed()}.
     */
    toggleCollapse() {
        this.setCollapsed(!this._collapsed);
    }
    /**
     * Collapses/uncollapses this page group.
     * @param {boolean} collapsed the new value
     */
    setCollapsed(collapsed) {
        this._collapsed = collapsed;
        if (collapsed) {
            this._navbarContents.style.height = "0";
            this._navbarContents.style.transform = "scaleY(0)";
            this._navbarHeader.classList.add("collapsed");
        } else {
            this._navbarContents.style.height = "" + (40 * this._pages.length) + "px";
            this._navbarContents.style.transform = "scaleY(1)";
            this._navbarHeader.classList.remove("collapsed");
        }
    }
    /**
     * Unregisters this page group along with all contained pages.
     * This method also clears the pages.
     */
    remove() {
        let array = this._pages;
        this._pages = [];
        for (let page of array) {
            UIManager.removePage(page);
        }
        UIManager.unregisterPageGroup(this);
    }
}
/**
 * Represents a page that the user can navigate to.
 * This class manages the navigation bar components
 * for this page.
 */
class UIPage {
    /**
     * The ID of this page.
     * @type {string}
     */
    _id;
    /**
     * The name of this page. This gets included
     * in the browser's page title. This is also
     * the visible name of the page in the navigation bar.
     * @type {FadingTextChanger}
     */
    _name;
    /**
     * The icon of this page. This is visible
     * in the navigation bar.
     * @type {FadingTextChanger}
     */
    _icon;
    /**
     * The enclosing page group of this page.
     * @type {UIPageGroup}
     */
    _group;

    /**
     * The list of components that this page currently has.
     * @type {Array<UIComponent>}
     */
    _components;

    /**
     * The HTML element in the navigation bar that represents the page.
     * @type {HTMLElement}
     */
    _object;
    /**
     * The HTML element in the navigation bar for the name.
     * @type {HTMLElement}
     */
    _nameObject;
    /**
     * The HTML element in the navigation bar for the icon.
     * @type {HTMLElement}
     */
    _iconObject;
    constructor(id, name="Unnamed Page", icon="material:article") {
        this._id = id;
        this._object = document.createElement("navbar_page");
        
        this._components = [];

        this._iconObject = document.createElement("navbar_page_icon");
        this._iconObject.setAttribute("translate", "no");
        this._iconObject.classList.add("material-symbols-outlined");
        this._icon = new FadingTextChanger(this._iconObject);
        this.setIcon(icon);
        this._object.appendChild(this._iconObject);

        this._nameObject = document.createElement("navbar_page_name");
        this._nameObject.innerText = name;
        this._name = new FadingTextChanger(this._nameObject);
        this._object.appendChild(this._nameObject);

        this._object.onclick = ()=>{
            UIManager.requestPage(this, this.getID());
        };
    }
    /**
     * Returns the ID of this page.
     * @returns {string} the page id
     */
    getID() {
        return this._id;
    }
    /**
     * Sets the page name to the specified string.
     * @param {string} name the new page name
     */
    setName(name) {
        this._name.changeTo(name);
    }
    /**
     * Sets the page icon to the specified string.
     * Note that this is a namespaced icon path.
     * @param {string} icon the new page icon
     */
    setIcon(icon) {
        if (icon.startsWith("material:")) {
            this._icon.changeTo(icon.substring("material:".length));
        }
    }
    /**
     * Returns the UIPageGroup that this page belongs to.
     * This method returns `null` if the group has not
     * yet been set.
     * @returns {UIPageGroup|null}
     */
    getGroup() {
        return this._group;
    }
    /**
     * Sets the UIPageGroup that this page belongs to.
     * @param {UIPageGroup} pageGroup the new page group
     */
    setGroup(pageGroup) {
        if (this._group == pageGroup) return;

        if (this._group != null) {
            this._group.removePage(this);
        }
        this._group = pageGroup;
        if (pageGroup != null) {
            pageGroup.addPage(this);
        }
    }
    /**
     * Marks this page as the currently selected page.
     */
    select() {
        this._object.classList.add("selected");
    }
    /**
     * Marks this page as no longer the currently selected
     * page. This action clears the component list.
     */
    deselect() {
        this._object.classList.remove("selected");
        // clear the children elements.
        this._components.length = 0;
    }
    /**
     * Adds a component to this page.
     * @param {UIComponent} component the component to add
     */
    addComponent(component) {
        this._components[component.getComponentID()] = component;
    }
    /**
     * Returns the component with the specified ID.
     * @param {number} componentID the ID of the component
     * @returns {UIComponent | null} the UIComponent if found, `null` otherwise
     */
    getComponent(componentID) {
        return this._components[componentID];
    }
    /**
     * Removes a component from this page.
     * @param {UIComponent} component the component to removed
     */
    removeComponent(component) {
        delete this._components[component.getComponentID()];
    }
}