import Cookies from 'https://esm.run/js-cookie@3.0.5';
import ENUM from 'https://esm.run/@novaras/js-enum@1.0.3';

/** The possible customer types */
export const CUSTOMER_TYPES = ENUM({
    BROADCASTER: 'broadcaster',
    PODCASTER: 'podcaster'
});

/** The customer type as given in the URL search params. */
export const PARAM_TYPE = (() => {
    const entry = [...(new URL(window.location.href)).searchParams].find(sp => sp[0] === 'type');
    return entry && entry[1];
})();

export const COOKIE_KEY = 'customer_type';
/**
    @type string
    The customer type as stored in the cookie.
    If the cookie doesn't exist, it will be set to `PARAM_TYPE` or `CUSTOMER_TYPES.BROADCASTER`
*/
export const COOKIE_TYPE = (() => {
    const cookie_type = Cookies.get(COOKIE_KEY);

    // if no cookie exists, set the cookie
    if (!cookie_type) {
        console.log(`No cookie type found; setting`);
        Cookies.set(COOKIE_KEY, PARAM_TYPE ? PARAM_TYPE : CUSTOMER_TYPES.BROADCASTER);

        // !!TODO!! popup
    }

    return Cookies.get(COOKIE_KEY);
})();

/** The resolved customer type. */
export const CUSTOMER_TYPE = PARAM_TYPE ?? COOKIE_TYPE;

/**
 * Gets the category data for the given customer type, or the type held in `CUSTOMER_TYPE`.
 * 
 * The customer articles are filtered & stored on the folders and categories for convenience.
 *
 * @param { string } [customer_type]
 */
export const getCategoriesData = (customer_type = CUSTOMER_TYPE, data_el) => {
    const container = data_el ?? document.getElementById("all-articles");
    const data = [];

    if (!container) throw new Error("Could not find DOM element to inspect for customer data!");

    for (const cat_el of [...container.children]) {
        const cat = { ...cat_el.dataset, folders: [] };
        for (const folder_el of [...cat_el.children]) {
            const folder = { ...folder_el.dataset, articles: [] };
            for (const article_el of [...folder_el.children]) {
                const article = { ...article_el.dataset, tags: article_el.dataset.tags.split().filter(tag => tag.length) };
                folder.articles.push(article);
            }
            const customer_articles = folder.articles.filter(article => article.tags.includes(customer_type));
            folder.customer_articles = customer_articles;
            cat.folders.push(folder);
        }

        const customer_folders = cat.folders.filter(folder => folder.customer_articles.length);
        cat.customer_folders = customer_folders;

        const customer_articles = cat.folders.reduce((articles, folder) => {
            return [
                ...articles,
                ...folder.customer_articles
            ];
        }, []);
        cat.customer_articles = customer_articles;

        data.push(cat);
    }

    return data;
};

/**
 * Fills the 'customer type selector', which is some `HTMLSelectElement`, either supplied or
 * searched by id `'customer-type-selection'`. For each type in `CUSTOMER_TYPES`, creates a
 * `HTMLOptionElement` for that type and inserts it into the selector.
 * 
 * Upon the select element firing the `'change'` event, sets the customer type cookie to the selected
 * value, and reloads the page.
 * 
 * @param { HTMLSelectElement } [select_element]
 */
export const fillCustomerTypeSelector = (select_element) => {
    /** @type HTMLSelectElement */
    const select_el = select_element ?? document.getElementById("customer-type-selection");

    if (!select_el) throw new Error("Could not find <select> to fill with customer types!");

    // the change listener; sets the cookie and reloads the page
    select_el.addEventListener("change", (ev) => {
        Cookies.set(COOKIE_KEY, ev.target.value);
        window.location.reload();
    });

    // here we add an option element for each customer type
    // the values are the types, and the text content is the same but capitalised
    for (const type of Object.values(CUSTOMER_TYPES)) {
        const option_el = document.createElement("option");
        option_el.value = type;
        option_el.text = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

        if (option_el.value === Cookies.get(COOKIE_KEY)) {
            option_el.selected = true;
        }

        select_el.appendChild(option_el);
    }
};
