import { Money, mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import { useThemeSettings } from "@weaverse/hydrogen";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { useState } from "react";
import type {
  ProductCardFragment,
  ProductVariantFragment,
} from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { NavLink } from "~/components/nav-link";
import { VariantPrices } from "~/components/variant-prices";
import { RevealUnderline } from "~/reveal-underline";
import { getImageAspectRatio } from "~/utils/image";
import { BestSellerBadge, NewBadge, SaleBadge, SoldOutBadge } from "./badges";
import { ProductCardOptions } from "./product-card-options";
import { QuickShopTrigger } from "./quick-shop";

const styleVariants = cva("", {
  variants: {
    alignment: {
      left: "",
      center: "text-center [&_.title-and-price]:items-center",
      right: "text-right [&_.title-and-price]:items-end",
    },
  },
});

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardFragment;
  className?: string;
}) {
  const {
    pcardBorderRadius,
    pcardBackgroundColor,
    pcardShowImageOnHover,
    pcardImageRatio,
    pcardTitlePricesAlignment,
    pcardAlignment,
    pcardShowVendor,
    pcardShowLowestPrice,
    pcardShowSalePrice,
    pcardEnableQuickShop,
    pcardQuickShopButtonType,
    pcardQuickShopButtonText,
    pcardQuickShopAction,
    pcardQuickShopPanelType,
    pcardShowSaleBadges,
    pcardShowBestSellerBadges,
    pcardShowNewBadges,
    pcardShowOutOfStockBadges,
  } = useThemeSettings();

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantFragment | null>(null);
  const { images, badges, priceRange } = product;
  const { minVariantPrice, maxVariantPrice } = priceRange;

  const firstVariant = product.selectedOrFirstAvailableVariant;
  const params = new URLSearchParams(
    mapSelectedProductOptionToObject(
      (selectedVariant || firstVariant)?.selectedOptions || []
    )
  );

  const isVertical = pcardTitlePricesAlignment === "vertical";
  const isBestSellerProduct = badges
    .filter(Boolean)
    .some(({ key, value }) => key === "best_seller" && value === "true");

  let [image, secondImage] = images.nodes;
  if (selectedVariant) {
    if (selectedVariant.image) {
      image = selectedVariant.image;
      const imageUrl = image.url;
      const imageIndex = images.nodes.findIndex(({ url }) => url === imageUrl);
      if (imageIndex > 0 && imageIndex < images.nodes.length - 1) {
        secondImage = images.nodes[imageIndex + 1];
      }
    }
  }

  return (
    <div
      className={clsx(
        "group rounded-(--pcard-radius) transition-all hover:border hover:border-[#DBD7D1] hover:shadow-lg",
        className
      )}
      style={
        {
          backgroundColor: pcardBackgroundColor,
          "--pcard-radius": `${pcardBorderRadius}px`,
          "--pcard-image-ratio": getImageAspectRatio(image, pcardImageRatio),
        } as React.CSSProperties
      }
    >
      <div
        className="transition-transform duration-300 group-hover:scale-95 rounded-(--pcard-radius) overflow-hidden"
        style={{ backgroundColor: pcardBackgroundColor }}
      >
        <div className="relative group">
          {image && (
            <Link
              to={`/products/${product.handle}?${params.toString()}`}
              prefetch="intent"
              className="overflow-hidden rounded-t-(--pcard-radius) block group relative aspect-(--pcard-image-ratio) bg-gray-100"
            >
              <Image
                className={clsx([
                  "absolute inset-0",
                  pcardShowImageOnHover &&
                    secondImage &&
                    "transition-opacity duration-300 group-hover:opacity-50",
                ])}
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                data={image}
                width={700}
                alt={image.altText || `Picture of ${product.title}`}
                loading="lazy"
              />
              {pcardShowImageOnHover && secondImage && (
                <Image
                  className={clsx([
                    "absolute inset-0",
                    "transition-opacity duration-300 opacity-0 group-hover:opacity-100",
                  ])}
                  sizes="auto"
                  width={700}
                  data={secondImage}
                  alt={
                    secondImage.altText || `Second picture of ${product.title}`
                  }
                  loading="lazy"
                />
              )}
            </Link>
          )}
          <div className="flex gap-1 absolute top-2.5 right-2.5">
            {pcardShowSaleBadges && (
              <SaleBadge
                price={minVariantPrice as MoneyV2}
                compareAtPrice={maxVariantPrice as MoneyV2}
              />
            )}
            {pcardShowBestSellerBadges && isBestSellerProduct && (
              <BestSellerBadge />
            )}
            {pcardShowNewBadges && (
              <NewBadge publishedAt={product.publishedAt} />
            )}
            {pcardShowOutOfStockBadges && <SoldOutBadge />}
          </div>
          <QuickShopTrigger productHandle={product.handle} />
        </div>
        <div
          className={clsx(
            "py-3 text-sm flex flex-col gap-2",
            isVertical && styleVariants({ alignment: pcardAlignment })
          )}
        >
          {pcardShowVendor && (
            <div className="uppercase text-body-subtle">{product.vendor}</div>
          )}
          <div className="md:hidden block">
              <ProductCardOptions
                product={product}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
              />
            </div>
          <NavLink
            to={`/products/${product.handle}?${params.toString()}`}
            prefetch="intent"
            className={({ isTransitioning }) =>
              clsx(
                "font-bold ",
                isTransitioning && "[view-transition-name:product-image]"
              )
            }
          >
            <RevealUnderline>{product.title}</RevealUnderline>
          </NavLink>
          <div
            className={clsx(
              "flex",
              isVertical
                ? "title-and-price flex-col gap-1"
                : "justify-between gap-4"
            )}
          >
            {pcardShowLowestPrice ? (
              <div className="flex gap-1">
                <span>From</span>
                <Money withoutTrailingZeros data={minVariantPrice} />
              </div>
            ) : (
              <VariantPrices
                variant={selectedVariant || firstVariant}
                showCompareAtPrice={pcardShowSalePrice}
              />
            )}
            <div className="md:block hidden">
              <ProductCardOptions
                product={product}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
