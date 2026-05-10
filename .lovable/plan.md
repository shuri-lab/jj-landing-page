## Plan

1. **Make the mobile CTA truly pinned to the iPhone viewport**
   - Replace the transform-based hide/show behavior on the bottom bar, because iOS Safari can misplace fixed elements when they use `transform` during scroll.
   - Use `opacity`, `pointer-events`, and `visibility` for show/hide instead, while keeping `position: fixed; bottom: 0; left: 0; right: 0`.

2. **Add iOS-safe viewport anchoring**
   - Add a dedicated CSS class for the sticky mobile CTA that uses `bottom: env(safe-area-inset-bottom, 0px)` and a fallback for older Safari.
   - Ensure the bar is outside normal page flow and always attached to the visual viewport bottom.

3. **Prevent content from being hidden behind the fixed bar**
   - Add mobile-only bottom padding to the page/footer area so the sticky bar does not cover the last content when visible.

4. **Keep the same design and behavior**
   - No copy/design changes.
   - The bar still appears after scrolling down and still scrolls to the offer when tapped.