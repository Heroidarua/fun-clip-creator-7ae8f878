# Plan - Fix Hero Duel Modal Layout

The user reported that the duel modal is being cut off, images are not well-centered, and the VS information is misaligned.

## Proposed Changes

### 1. Fix Modal Containment and Scrolling
- Adjust `src/components/ComicsSection.tsx` to ensure the modal content is properly contained and scrollable on all devices.
- Replace `min-h-full` with `h-fit` or proper `max-h` constraints to prevent content being cut off.

### 2. Center Images and VS Information
- Refine the grid and flex layouts in the duel result modal to ensure perfect centering of hero images and the "VS" badge.
- Adjust the alignment of power stats and names.

### 3. Responsive Adjustments
- Fine-tune mobile spacing and font sizes to ensure all information fits within the viewport without being cut off at the bottom.

## Technical Details

### `src/components/ComicsSection.tsx`
- Modify lines 508-509 to improve the modal container.
- Update lines 526-597 to fix the side-by-side fighter columns and the central "VS" badge positioning.
- Ensure `calculateTotalStats` and other logic remain intact while improving the visual structure.
