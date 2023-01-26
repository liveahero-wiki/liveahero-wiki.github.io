const path = require("path");
const { DateTime } = require("luxon");
const yaml = require("js-yaml");
// const markdownItAnchor = require("markdown-it-anchor");

// const pluginRss = require("@11ty/eleventy-plugin-rss");
// const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
// const pluginNavigation = require("@11ty/eleventy-navigation");
// const eleventyImage = require("@11ty/eleventy-img");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const wiki_plugins = require("./wiki_plugins/index.js");

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy({
        "./assets/": "/assets/",
        //"./cdn/": "/cdn/",
    });

    // Run Eleventy when these files change:
    // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

    // Process content images to the image pipeline.
    // eleventyConfig.addWatchTarget("content/**/*.{png,jpeg}");


    // Plugins
    // eleventyConfig.addPlugin(pluginRss);
    // eleventyConfig.addPlugin(pluginSyntaxHighlight);
    // eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addPlugin(eleventyConfig => {
        function relativeToInputPath(inputPath, relativeFilePath) {
            let split = inputPath.split("/");
            split.pop();

            return path.resolve(split.join(path.sep), relativeFilePath);
        }

        // eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, sizes) {
        // 	let file = relativeToInputPath(this.page.inputPath, src);
        // 	let metadata = await eleventyImage(file, {
        // 		widths: ["auto"],
        // 		// You can add "avif" or "jpeg" here if you’d like!
        // 		formats: ["webp", "png"],
        // 		outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
        // 	});
        // 	let imageAttributes = {
        // 		alt,
        // 		sizes,
        // 		loading: "lazy",
        // 		decoding: "async",
        // 	};
        // 	return eleventyImage.generateHTML(metadata, imageAttributes);
        // });
    });

    // Drafts implementation, see `content/content.11tydata.js` for additional code.
    // This section *could* be simplified to an environment variable in an npm script,
    // but this way an ENV is not required and this code works cross-platform.
    eleventyConfig.addPlugin(function enableDrafts(eleventyConfig) {
        let logged = false;
        eleventyConfig.on("eleventy.before", ({ runMode }) => {
            // Only show drafts in serve/watch modes
            if (runMode === "serve" || runMode === "watch") {
                process.env.BUILD_DRAFTS = true;

                // Only log once.
                if (!logged) {
                    console.log("[11ty/eleventy-base-blog] including `draft: true` posts");
                }

                logged = true;
            }
        });
    })

    // Filters
    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
        // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
        return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
    });


    wiki_plugins(eleventyConfig)

    // Customize Markdown library settings:
    //eleventyConfig.amendLibrary("md", mdLib => {
    //	mdLib.use(markdownItAnchor, {
    //		permalink: markdownItAnchor.permalink.ariaHidden({
    //			placement: "after",
    //			class: "direct-link",
    //			symbol: "#",
    //		}),
    //		level: [1,2,3,4],
    //		slugify: eleventyConfig.getFilter("slugify")
    //	});
    //});

    // Features to make your build faster (when you need them)

    // If your passthrough copy gets heavy and cumbersome, add this line
    // to emulate the file copy on the dev server. Learn more:
    // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

    eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

    eleventyConfig.addLayoutAlias('chara', 'chara.html');
    eleventyConfig.addLayoutAlias("compress", 'compress.html');
    eleventyConfig.addLayoutAlias("default", 'default.html');
    eleventyConfig.addLayoutAlias("event", 'event.html');
    eleventyConfig.addLayoutAlias("main_quests", 'main_quests.html');
    eleventyConfig.addLayoutAlias("markdownify", 'markdownify.html');
    eleventyConfig.addLayoutAlias("post", 'post.html');
    eleventyConfig.addLayoutAlias("scss", 'scss.html');

    const site = {
        "title": "Live A Hero Wiki",
        "url": "https://liveahero-wiki.github.io",
        "github_repo": "https://github.com/liveahero-wiki/liveahero-wiki.github.io",
        "timezone": "Asia/Tokyo",
        "date_format": "%-d %b %Y %R JST",
        "time": new Date(),
    };
    const collections = ["posts", "events", "charas", "main_quests"];

    for (const collection of collections) {
        let pages = null;

        eleventyConfig.addCollection(collection, function (collectionApi) {
            pages = collectionApi.getFilteredByGlob(`_${collection}/*.md`);
            if (collection == "event") {
                pages.sort(function(a, b) {
                    return a.data.event_start_time - b.data.event_start_time;
                });
            }

            return pages
        });
        site[collection] = () => pages;
    }

    eleventyConfig.addGlobalData("site", function () {
        return site
    })

    eleventyConfig.setLiquidOptions({
        dynamicPartials: false,
        jekyllInclude: true,
        //strictFilters: false, // renamed from `strict_filters` in Eleventy 1.0
    });

    eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

    return {
        // Control which files Eleventy will process
        // e.g.: *.md, *.njk, *.html, *.liquid
        templateFormats: [
            "md",
            "html",
            "liquid"
        ],


        dir: {
            input: ".",
            includes: "_includes",
            layouts: "_layouts",
            data: "_data",
            output: "_site"
        },

        // -----------------------------------------------------------------
        // Optional items:
        // -----------------------------------------------------------------

        // If your site deploys to a subdirectory, change `pathPrefix`.
        // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

        // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
        // it will transform any absolute URLs in your HTML to include this
        // folder name and does **not** affect where things go in the output folder.
        pathPrefix: "/",
    };
};
