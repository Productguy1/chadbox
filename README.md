# Chadbox landing page

Marketing site for Chadbox, the sandbox for running untrusted code. It's plain HTML, CSS and JavaScript, with no framework, no dependencies and no build step.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deploy

The folder deploys as-is to any static host. On Vercel, import the repo and leave the framework preset on "Other": there's no build command and the output directory is the project root.

## Project structure

```
.
├── index.html        Page markup. Each section is labelled with an HTML comment.
├── css/
│   └── styles.css    All styles. Design tokens live in :root at the top.
└── js/
    ├── iso.js        Isometric scene engine: draws and animates the illustrations.
    ├── main.js       Page code: one numbered block per section.
    └── game.js       "Contain the breach", the full-screen pixel-art game below the footer.
```

Load order matters: `iso.js` defines `window.ChadboxIso`, and `main.js` reads from it. `game.js` stands alone and loads last.

## Common edits

**Colours and fonts.** Change the tokens in `:root` at the top of `css/styles.css`. `--accent` (amber) drives every highlight, including the illustrations.

**Copy.** All text is in `index.html`. Labels inside the illustrations (for example `'Sealed box'`, `'Code in'`) are in the `labels` arrays in `js/main.js`; CSS displays them in uppercase.

**Illustrations.** Every scene is a spec object passed to `new Scene(host, spec)` in `js/main.js`. The format, the part types and the animation API are documented at the top of `js/iso.js`. For example, a sealed box holding code on a small grid:

```js
new Scene(document.getElementById('my-host'), {
  k: 26, grid: 1, alt: 'A sealed box with code inside',
  items: sealed('box', 0, 0, 0.6, 1.2)
});
```

**Motion.** Timelines are functions of `t` (0 to 1) handed to `play()`. Loops only run while on screen. Visitors with "reduce motion" turned on see a still frame, set by `still`.

**Get started code samples.** The cURL, Python and local-install snippets are the three `<pre class="code-block">` elements in the `#start` section. Visitors can edit them; they reset when focus leaves. Their footer text lives in the `meta` object in block 10 of `js/main.js`.

## Before launch

- [ ] Replace the six example logos in the logo strip (Orbitwise, Kiln and the rest are made up).
- [ ] Update the GitHub star count in the nav (currently a hard-coded `2K`).
- [ ] Check the FAQ answers (copied from chadbox-cloud-landing-page.vercel.app) against real behaviour.
- [ ] Check the GitHub links: the clone command uses `github.com/cryptomafiaPB/chadbox.git`, while the other links point to `github.com/chadbox/chadbox`.
- [ ] Confirm the Python SDK example (`from chadbox import Chadbox`, `cb.execute(...)`) matches the real package.
- [ ] Check the illustrative details in the feature panels (sample system calls, `example.com`, "no interface but loopback") against real behaviour.
- [ ] Point the Sign in, Get API key and Discord links at real destinations.
