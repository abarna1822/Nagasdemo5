import { useEffect, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import type { Product } from '../types/commerce';
import { formatINR } from '../utils/commerce';
import { useNagasStore } from '../store/StoreContext';
import { ProductMedia } from './ProductMedia';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickViewModal({
  product,
  onClose,
}: ProductQuickViewModalProps) {
  const { addToCart, setIsCartOpen } = useNagasStore();
  const [selectedFormat, setSelectedFormat] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedFormat(product.variants[0]?.format ?? '');
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.format === selectedFormat) ??
    product.variants[0];

  const handleAdd = () => {
    if (product.soldOut || !activeVariant) return;
    addToCart(product, activeVariant.format, quantity);
    setAdded(true);
    window.setTimeout(() => {
      onClose();
      setIsCartOpen(true);
    }, 450);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view ${product.name}`}
      className="fixed inset-0 z-[150] bg-[#141D2B]/65 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#141D2B]/15 overflow-hidden grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-[#F9F6EF]">
          <ProductMedia
            src={product.imageUrl}
            alt={product.name}
            focus={product.imageFocus}
          />
          {product.soldOut && (
            <div className="absolute inset-0 bg-[#141D2B]/45 flex items-center justify-center">
              <span className="border-2 border-[#FFFDF9] text-[#FFFDF9] font-display font-bold uppercase tracking-widest px-5 py-2 -rotate-6 bg-[#10213A]/90">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-5 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute top-4 right-4 p-2 rounded-lg text-[#141D2B]/70 hover:bg-[#141D2B]/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#1F3A5F] font-semibold">
              {product.origin} ·{' '}
              {product.category === 'dry-fruits'
                ? 'Pouch & Box Range'
                : product.category === 'honey'
                ? 'Honey Collections'
                : 'Dates & More'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141D2B] mt-1 pr-8">
              {product.name}
            </h2>
            <p className="font-script text-xl text-[#E09F2D] mt-1">
              {product.tastingNote}
            </p>
          </div>

          <p className="text-sm text-[#141D2B]/80 leading-relaxed">
            {product.description}
          </p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141D2B]/60 mb-2">
              Select Pack Format
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const isSelected = variant.format === activeVariant?.format;
                return (
                  <button
                    key={variant.format}
                    type="button"
                    onClick={() => setSelectedFormat(variant.format)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#141D2B] text-[#FFFDF9] border-[#141D2B]'
                        : 'bg-[#F9F6EF] text-[#141D2B] border-[#141D2B]/15 hover:border-[#1F3A5F]'
                    }`}
                  >
                    <span>{variant.format}</span>
                    <span className="ml-2 tabular-nums opacity-85">
                      {formatINR(variant.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#141D2B]/10 flex items-center justify-between gap-4 mt-auto">
            <div>
              <p className="text-xs text-[#141D2B]/60">Unit Price</p>
              <p className="font-display text-2xl font-bold text-[#1F3A5F] tabular-nums">
                {activeVariant ? formatINR(activeVariant.price * quantity) : '—'}
              </p>
            </div>

            <div className="flex items-center border border-[#141D2B]/20 rounded-lg bg-[#F9F6EF]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-[#141D2B] hover:bg-[#141D2B]/5 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 text-[#141D2B] hover:bg-[#141D2B]/5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={product.soldOut}
            onClick={handleAdd}
            className={`w-full py-3 px-6 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? 'bg-[#1E8449] text-[#FFFDF9]'
                : 'bg-[#1F3A5F] text-[#FFFDF9] hover:bg-[#10213A]'
            }`}
          >
            {product.soldOut ? (
              <span>Currently Sold Out</span>
            ) : added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Cart</span>
              </>
            ) : (
              <span>
                Add to Cart ·{' '}
                {activeVariant ? formatINR(activeVariant.price * quantity) : ''}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
