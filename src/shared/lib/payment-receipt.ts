export type PaymentReceipt = {
  referenceNumber: string
  accountName: string
  fileName: string
  imageUrl: string
  uploadedAt: string
}

export function createMockPaymentReceipt({
  venue,
  accountName,
  referenceNumber,
  amount,
  uploadedAt,
}: {
  venue: string
  accountName: string
  referenceNumber: string
  amount: number
  uploadedAt: string
}): PaymentReceipt {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" role="img" aria-label="Prototype payment receipt">
      <rect width="720" height="1280" fill="#f3f4f6"/>
      <rect x="48" y="48" width="624" height="1184" rx="28" fill="#ffffff"/>
      <text x="96" y="126" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#111827">
        Prototype Payment Receipt
      </text>
      <text x="96" y="168" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">
        For UI demonstration only
      </text>
      <rect x="96" y="220" width="528" height="2" fill="#e5e7eb"/>
      <text x="96" y="292" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Venue</text>
      <text x="96" y="328" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${venue}</text>
      <text x="96" y="400" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Sender</text>
      <text x="96" y="436" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${accountName}</text>
      <text x="96" y="508" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Reference number</text>
      <text x="96" y="544" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${referenceNumber}</text>
      <text x="96" y="616" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Amount sent</text>
      <text x="96" y="652" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">$${amount.toFixed(2)}</text>
      <text x="96" y="724" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Uploaded at</text>
      <text x="96" y="760" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${uploadedAt}</text>
      <rect x="96" y="832" width="528" height="280" rx="20" fill="#111827"/>
      <text x="360" y="970" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">
        PAYMENT PROOF
      </text>
      <text x="360" y="1016" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#d1d5db">
        Simulated screenshot for prototype review
      </text>
    </svg>
  `

  return {
    referenceNumber,
    accountName,
    fileName: `${venue.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-prototype-receipt.png`,
    imageUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    uploadedAt,
  }
}
