# Canopy Tent Configurator

A working replica of [MVP Visuals' 10x10 Logo Canopy Tent configurator](https://mvpvisuals.com/products/10x10-custom-canopy-tent): a React + TypeScript product configurator with a synchronized 2D artwork editor and 3D preview, dynamic pricing through a mocked service layer, a mocked Shopify add-to-cart integration, and a generated production-summary PDF.

Built against the three GLB models provided for the test (5×5, 6.5×6.5, 8×8 ft frames).

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build to dist/
```

No environment variables or API keys are required — the backend is mocked (see below).

To see it embedded in a host page via `<iframe>`, run the dev server and open `/embed-example.html`.

## Architecture

The guiding idea: **nothing in the engine or UI layer knows it's rendering a tent.** Everything product-specific — panel layout, size variants, GLB paths, frame colors, pricing rules — lives in one data file (`src/data/products/tent.ts`) that satisfies a generic `ProductDefinition` type (`src/types/product.ts`). Adding a second product is a new data file plus one line in the registry (`src/data/products/index.ts`); no component or store code changes.

```
src/
  types/            ProductDefinition, ProductConfiguration, PriceQuote, Shopify contracts
  data/products/     the actual product catalog (tent.ts) + registry
  engine/            product-agnostic logic: state store, canvas renderer, pricing calc, texture hook
  services/          API clients + the mocked backend (MSW) + PDF generation
  features/          UI, organized by concern (editor2d, viewer3d, pricing, cart, pdfExport, configurator)
  app/                bootstrap + iframe embed bridge
```

### The data model

`ProductConfiguration` (`src/types/configuration.ts`) is the single structured record that flows through the whole app — the 2D editor writes to it, the 3D preview reads from it, the pricing service prices it, the PDF generator renders it, and the Shopify integration serializes it onto the cart. It's plain, serializable JSON (no React/Three types inside it), which is what makes it easy to persist, price server-side, and hand off to fulfillment.

A product is described as a set of **zones** (`ProductZone`) laid out on one shared flattened-artwork canvas (`ProductDefinition.layoutSize`) — for the tent, 4 roof panels + 4 valance strips. Each zone independently tracks its own base color and holds its own `ConfigurationElement`s (text or image, each with its own transform), which is what satisfies "different product sections can be customized independently" without hard-coding panel geometry into any component.

### 2D/3D synchronization

This was the part most worth getting right, so here's the actual mechanism:

- `src/engine/renderLayout.ts` is a **pure Canvas2D function**: `(ctx, product, configuration) => void`. It has no DOM, React, or Three.js dependency — it just paints zone backgrounds and elements onto a 2D context. Because it's pure, it is the single source of truth for "what the artwork looks like," reused by two different consumers.
- `src/engine/useLayoutTexture.ts` calls that function into an off-screen `<canvas>` and wraps it in a `THREE.CanvasTexture`. Any store update (drag an element, recolor a zone, add text) re-renders that canvas and flips `texture.needsUpdate`; react-three-fiber picks it up on the next frame. No manual diffing or message-passing between the 2D and 3D layers — they're both just views over the same `ProductConfiguration`, one rendered to the DOM (interactive, via `react-rnd`) and one rendered to a texture (via Canvas2D), driven by the same Zustand store.
- The same `drawLayoutToCanvas` function is also called for the PDF export's "flattened artwork" preview image, so the editor, 3D preview, and PDF are all guaranteed to agree.
- In `TentModel.tsx`, the texture is applied by matching **material name** (`fabric_Mat`) rather than mesh/node name — the source GLBs put the print surface and the frame hardware on different material slots of the same mesh, so matching by material is what's actually robust across differently-organized model hierarchies, and it's what keeps `TentModel` itself product-agnostic (it just needs `fabricMaterialName`/`frameMaterialNames` off the variant).

**Known limitation:** the flattened 2D layout (4 roof panels left-to-right + 4 valance strips) is my best reconstruction of how the artwork should be arranged to match the model's baked UV unwrap, since only the exported GLBs were provided (no source file/UV reference). The sync mechanism itself is verified end-to-end — recoloring any of the 8 zones immediately repaints a distinct region of the 3D model — but the exact physical "front/back/left/right" correspondence between a 2D zone and its real-world panel is approximate. In production, this would be nailed down once against the actual source UVs and is a data-only fix (the `rect` values in `tent.ts`), not an architecture change.

### Pricing

The UI never computes a price. `usePriceQuote` (`src/features/pricing/`) debounces configuration changes and calls `fetchPriceQuote` (`src/services/api/pricingApi.ts`), which does a plain `fetch('/api/pricing/quote', …)`. That request is intercepted at the network layer by [MSW](https://mswjs.io/) (`src/services/mocks/handlers.ts`), which runs the actual pricing algorithm (`src/engine/pricingEngine.ts` — base price + variant delta + frame color + per-zone customization fees with the first location free + per-zone recolor surcharge + per-image digitization fee, × quantity) and returns it as if it were a real HTTP response.

This satisfies "pricing obtained through an API/service rather than hard-coded into the UI" literally: the UI genuinely only knows the `PriceQuoteRequest`/`PriceQuoteResponse` contract in `src/types/pricing.ts`. Swapping the mock for a real pricing endpoint (or a Shopify Function) means deleting `services/mocks/` and pointing `VITE_API_BASE_URL` at it — zero UI changes.

### Shopify integration

Modeled as the pattern a real integration would need, mocked end to end:

1. `saveConfiguration` (`src/services/api/shopifyApi.ts`) posts the full `ProductConfiguration` + resolved `PriceQuoteResponse` to `/api/configurations` and gets back a short `configurationId`. This exists because a Shopify cart line item can only carry small string **properties**, not an arbitrary nested JSON document — so the full record is saved server-side and only referenced from the cart.
2. `addToShopifyCart` adds the real Shopify variant (`ProductVariant.shopifyVariantId`) to the cart with line item properties including `_configuration_id`. In production, a webhook or the order-fulfillment pipeline would use that id to pull the full configuration back from the backend — e.g., to regenerate/attach the production PDF to the order, which is exactly what "the PDF should be structured so it could later be attached to or associated with the Shopify order" is asking for.
3. Because Shopify doesn't let a line item override its own price arbitrarily, a real deployment would resolve the customization surcharge via a **Shopify Function / Cart Transform** keyed off `_configuration_id` (or a Draft Order for fully custom pricing) — the mock endpoint simulates this by looking up the saved configuration server-side and returning the authoritative price, rather than trusting whatever the client sends.
4. On success, the app also `postMessage`s an `ADD_TO_CART` event to the parent window (see Embedding below), so a host storefront page embedding this in an iframe can react to it.

See the doc comments at the top of `src/types/shopify.ts` and `src/features/cart/AddToCartPanel.tsx` for the full reasoning.

### PDF generation

`src/services/pdf/generateProductionPdf.ts` builds a structured "production summary" (configuration id, size/frame/quantity, the flattened artwork + 3D preview images, a per-zone customization breakdown, and the price breakdown) with [jsPDF](https://github.com/parallax/jsPDF), reusing the exact same layout-canvas renderer and captured WebGL frame that the live UI shows. It's kept as a pure builder function that takes a plain data object and returns a `jsPDF` document — not tied to a click handler — so the same function could run server-side (e.g., triggered by the Shopify order webhook) given the saved configuration record.

### Embeddability

No `X-Frame-Options`/`frame-ancestors` restriction is set (see `vite.config.ts`), so the app can be embedded directly. `src/app/embedBridge.ts` provides:
- `getEmbeddedProductId()` — reads `?productId=` from the iframe URL so a host page can choose which product to show.
- `notifyHost()` — posts `CONFIGURATOR_READY` and `ADD_TO_CART` events to the parent window.

`public/embed-example.html` is a minimal standalone host page demonstrating both (open it with the dev server running).

### Performance

- The 3D viewer (`@react-three/fiber` + `three`, the heaviest dependency by far) is code-split with `React.lazy`/`Suspense`, so a 2D-only editing session doesn't pay for it upfront.
- `jsPDF` is dynamically `import()`-ed only when the export button is actually clicked.
- Pricing requests are debounced (300ms) and abort in-flight requests on rapid edits, so dragging an element doesn't flood the network.
- The 3D preview is lit with local lights rather than a drei `<Environment>` HDRI preset — that component fetches from a third-party CDN at runtime, which is both an avoidable network dependency and a real reliability risk for something as core as the product preview (it's what caused the model to silently fail to render in a locked-down test environment during development).
- Camera framing uses drei's `<Bounds>` to auto-fit each variant's model regardless of its authored scale, instead of hand-tuned per-model camera constants.

### What's intentionally mocked, and how it plugs into something real

| Mocked here | Real equivalent |
|---|---|
| MSW request handlers (`services/mocks/`) | A real pricing microservice / Shopify Function |
| In-memory `Map` "database" for saved configs | A real database keyed by `configurationId` |
| `shopifyVariantId` / `shopifyProductId` as literal GIDs | Real Shopify Storefront/Admin API ids |
| `saveConfiguration` + `/cart/add` mock | Storefront API `cartLinesAdd` / theme `/cart/add.js`, plus a webhook consumer |
| Image upload → data URL | Upload to object storage, store the resulting URL |

Everything on the left talks to the app through the exact same typed contract (`src/types/pricing.ts`, `src/types/shopify.ts`) it would use in production, which is the actual point of structuring it this way.

## Trade-offs given the ~8–10h scope

- One real product (the tent) is implemented in full; the reusability claim is demonstrated through the type/registry design rather than a second product, to keep scope honest.
- No automated test suite — verification was done by driving the running app end-to-end (2D edits reflected in 3D, variant/frame/quantity changes, add-to-cart, PDF export, mobile layout) rather than writing unit tests, given the time budget. `src/engine/{renderLayout,pricingEngine}.ts` are pure functions specifically so they're cheap to unit test later.
- Image uploads are stored as data URLs in the configuration record for simplicity; noted above as the one thing to swap for real storage before production.
# configurator
