# Personal blog

Jekyll site served by GitHub Pages.

- New post: add `_posts/YYYY-MM-DD-title.md` with a front-matter block (`layout: post`, `title:`), commit, push.
- Look: `assets/main.scss` restyles minima in the moses-black palette, with gruvbox dark for code. JetBrains Mono is served from `assets/fonts/` (licence alongside).
- `_includes/footer.html` keeps the footer to the site description; `_includes/head.html` adds the favicon.
- Home page greeting and particle field: `assets/js/home.js` (no CDN; still for reduced-motion visitors).
- `privacy.md` is the site's privacy page; keep its URL (`/privacy/`) stable.
