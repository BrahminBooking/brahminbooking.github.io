# Design Sources

The Panchang-first homepage introduced in August 2026 uses repository-owned
components and styling. The following open sources informed its interaction
patterns:

- [Motion for React](https://motion.dev/docs/react): entrance sequencing,
  hover/tap feedback, shared-layout tab transitions, presence transitions, and
  reduced-motion handling. The project uses the `motion` package directly.
- [Kokonut UI](https://kokonutui.com/): its smooth tabs and layered card
  examples informed the visual direction. Kokonut UI is MIT-licensed; no paid
  component source was copied into this repository.

[Bklit](https://bklit.com/) was assessed for charting. The homepage does not
contain a meaningful data visualization, so no chart library or related client
weight was added.
