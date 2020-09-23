# LAH Wiki

## Get started

Read your stuff in https://jekyllrb.com/

## Heroes

Heroes are registered in the `_heroes` directory. Each `.md` is one data record. Each hero will have a page with `_layout/heroes.html` template.
You can access the info through `site.heroes` when doing templating, see how it used in `/heroes.html` for example.

https://jekyllrb.com/docs/collections/ is used here.

## Code convention

You can use any modern HTML/CSS/JS features you like. Bootstrap and JQuery are banned, other dependencies can be considered.

Most pages can be a Markdown file as it is easier to read and write. More technical pages like list of heroes can be HTML file if you need more control over the final html output.

Put static files under `/assets`. `/assets/imgs` for images, `/assets/js` for reusable js code.
