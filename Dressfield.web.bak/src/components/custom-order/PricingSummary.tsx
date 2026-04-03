"use client";

interface PricingSummaryProps {
  basePrice: number;
  embroideryExtra: number;
}

export function PricingSummary({
  basePrice,
  embroideryExtra,
}: PricingSummaryProps) {
  const total = basePrice + embroideryExtra;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xl font-semibold text-gray-500">ფასის განაწილება</h3>
      <div className="space-y-2 text-base">
        <div className="flex justify-between">
          <span className="text-gray-600">ბაზისური ფასი:</span>
          <span className="font-medium">₾{basePrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">+ ნაქარგის ზომა:</span>
          <span className="font-medium">
            {embroideryExtra > 0 ? `₾${embroideryExtra}` : "—"}
          </span>
        </div>
        <div className="my-2 border-t border-gray-200" />
        <div className="flex justify-between">
          <span className="font-semibold text-foreground">სულ:</span>
          <span className="text-lg font-bold text-accent">₾{total}</span>
        </div>
      </div>
    </div>
  );
}
