# `fd-customer-type`

The `main` script exports a bunch of essential data for use on the Freshdesk portals wherever we need to do some work with the customer's type.

The customer type is the value given by a search parameter, or a value stored in a cookie.

If the cookie is not set, it is set to the value of the search param if found, or defaults to `'broadcaster'`.

### `getCategoriesData`

This function grabs all information for the portal and works it to find data related to a customer type. For this to work, the following markup **MUST** exist in the portal page's template:

```liquid
<div id="all-articles">
    {% for category in portal.solution_categories %}
        <div data-id="{{ category.id }}" data-name="{{ category.name }}">
            {% for folder in category.folders %}
                <div data-id="{{ folder.id }}" data-name="{{ folder.name }}">
                    {% for article in folder.articles %}
                        <div style="width: 0; height: 0; display: none;"
                             data-id="{{ article.id }}"
                             data-title="{{ article.title }}"
                             data-tags="{{ article.tags | map: 'name' | join }}"
                        ></div>
                    {% endfor %}
                </div>
            {% endfor %}
        </div>
    {% endfor %}
</div>
```
