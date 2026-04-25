import type { Product } from '@/types/product'
import { VI } from '@/constants/vietnamese'

interface SpecsTableProps {
  product: Product
}

export default function SpecsTable({ product }: SpecsTableProps) {
  const rows = [
    { label: VI.product.specLabels.frameType, value: VI.catalog.frameTypes[product.type] },
    { label: VI.product.specLabels.shape, value: VI.catalog.frameShapes[product.shape] },
    { label: VI.product.specLabels.material, value: VI.catalog.materials[product.material] },
    { label: VI.product.specLabels.gender, value: VI.catalog.genders[product.gender] },
    { label: VI.product.specLabels.bridgeWidth, value: VI.common.mm(product.specs.bridgeWidth) },
    { label: VI.product.specLabels.lensWidth, value: VI.common.mm(product.specs.lensWidth) },
    { label: VI.product.specLabels.templeLength, value: VI.common.mm(product.specs.templeLength) },
    { label: VI.product.specLabels.frameWidth, value: product.specs.frameWidth },
    { label: VI.product.specLabels.weight, value: VI.common.grams(product.specs.weight) },
  ]

  return (
    <div>
      <h3 className="text-base font-bold text-brand-black mb-3">{VI.product.specsTitle}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="bg-brand-light rounded-xl px-3 py-2.5">
            <p className="text-xs text-brand-muted">{row.label}</p>
            <p className="text-sm font-bold text-brand-black mt-0.5">{row.value ?? '—'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
