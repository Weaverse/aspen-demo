import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

interface CollectionListDynamicProps 
  extends VariantProps<typeof variants> {
  children?: React.ReactNode;
}

let variants = cva("flex flex-col [&_.paragraph]:mx-[unset]", {
  variants: {
    contentPosition: {
      left: "justify-center items-start [&_.paragraph]:[text-align:left]",
      center: "justify-center items-center [&_.paragraph]:[text-align:center]",
      right: "justify-center items-end [&_.paragraph]:[text-align:right]",
    },
    gap: {
      0: "gap-0",
      4: "gap-1",
      8: "gap-2",
      12: "gap-3",
      16: "gap-4",
      20: "gap-5",
      24: "gap-6",
      28: "gap-7",
      32: "gap-8",
      36: "gap-9",
      40: "gap-10",
      44: "gap-11",
      48: "gap-12",
      52: "gap-[52px]",
      56: "gap-14",
      60: "gap-[60px]",
    },
  },
  defaultVariants: {
    contentPosition: "center",
    gap: 32,
  },
});

let CollectionContentDynamic = forwardRef<
  HTMLDivElement,
  CollectionListDynamicProps
>((props, ref) => {
  let { children, contentPosition, gap, ...rest } = props;

  return (
    <div
      ref={ref}
      {...rest}
      className={variants({
        contentPosition,
        gap,
      })}
    >
      {children}
    </div>
  );
});

export default CollectionContentDynamic;

export let schema: HydrogenComponentSchema = {
  type: "collection-content-dynamic",
  title: "Collection content dynamic",
  limit: 1,
  childTypes: ["heading", "subheading", "paragraph", "button"],
  inspector: [
    {
      group: "Collection List",
      inputs: [
        {
          type: "toggle-group",
          name: "contentPosition",
          label: "Content position",
          defaultValue: "center",
          configs: {
            options: [
              { value: "left", label: "left" },
              { value: "center", label: "center" },
              { value: "right", label: "right" },
            ],
          },
        },
        {
          type: "range",
          name: "gap",
          label: "Gap",
          defaultValue: 32,
          configs: {
            min: 0,
            max: 60,
            step: 4,
            unit: "px",
          },
        },
      ],
    },
  ],
  presets: {
    gap: 32,
    children: [{ type: "heading", content: "Collections" }],
  },
};
