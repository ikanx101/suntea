import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { formatRupiah, formatDateTime } from "@/lib/format";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");

let fontsCache: { name: string; data: Buffer; weight: 400 | 700 }[] | null = null;

function loadFonts() {
  if (fontsCache) return fontsCache;
  fontsCache = [
    { name: "Nunito", data: fs.readFileSync(path.join(FONT_DIR, "Nunito-Regular.woff")), weight: 400 },
    { name: "Nunito", data: fs.readFileSync(path.join(FONT_DIR, "Nunito-Bold.woff")), weight: 700 },
    { name: "Baloo 2", data: fs.readFileSync(path.join(FONT_DIR, "Baloo2-Bold.woff")), weight: 700 },
  ];
  return fontsCache;
}

export type InvoiceItem = {
  name: string;
  qty: number;
  /** Harga satuan (snapshot) sebelum diskon. */
  unitPrice: number;
  /** Harga kotor baris ini: unitPrice × qty. */
  gross: number;
  /** Nominal diskon baris ini (Rupiah); 0 berarti tanpa diskon. */
  discount: number;
  /** Harga bersih baris ini: gross - discount. */
  net: number;
};

export type InvoiceData = {
  storeName: string;
  logoDataUrl: string | null;
  invoiceNumber: string;
  orderDate: Date;
  customerName: string;
  customerWhatsapp: string;
  items: InvoiceItem[];
  /** Jumlah harga barang sebelum diskon. */
  itemsSubtotal: number;
  /** Total diskon seluruh barang; 0 berarti tidak ada diskon. */
  itemsDiscount: number;
  /** Nilai ongkir; 0 berarti tidak ada ongkir. */
  shippingCost: number;
  /** Total tagihan = (itemsSubtotal − itemsDiscount) + shippingCost. */
  total: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  note: string | null;
};

const WIDTH = 1080;

// Palet invoice — senada dengan tema turquoise aplikasi.
const C = {
  pageBg: "#f2fbfa",
  headerFrom: "#17b3aa",
  headerTo: "#22d3ee",
  cardBorder: "#d3f9f4",
  line: "#a8f2e9",
  tableHead: "#17b3aa",
  rowAlt: "#f0fcfa",
  ink: "#124d4c",
  inkStrong: "#115e5c",
  accent: "#0f7471",
  soft: "#327187",
  softBg: "#f2f9fa",
  softInk: "#27414e",
  noteBg: "#ecfeff",
  noteTitle: "#0e7490",
  noteInk: "#164e63",
  footerBg: "#e9f9f7",
  footerTitle: "#0e918c",
  summaryBg: "#d3f9f4",
};

export async function renderInvoicePng(data: InvoiceData): Promise<Buffer> {
  const fonts = loadFonts();

  const hasShipping = data.shippingCost > 0;
  const hasDiscount = data.itemsDiscount > 0;

  // Tinggi kanvas TIDAK dipatok: satori menghitung sendiri sesuai isi
  // (jumlah barang, ada/tidaknya baris ongkir, dan panjang catatan).
  // Ini mencegah bagian bawah invoice (baris ucapan terakhir) terpotong.
  const markup = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: WIDTH,
        backgroundColor: C.pageBg,
        fontFamily: "Nunito",
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "48px 56px 32px 56px",
          background: `linear-gradient(135deg, ${C.headerFrom} 0%, ${C.headerTo} 100%)`,
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {data.logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logoDataUrl}
              alt=""
              width={72}
              height={72}
              style={{ borderRadius: 20, backgroundColor: "#fff" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "Baloo 2", fontSize: 44, fontWeight: 700 }}>{data.storeName}</span>
            <span style={{ fontSize: 24, opacity: 0.9 }}>Invoice Pesanan</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, fontSize: 26 }}>
          <span>{data.invoiceNumber}</span>
          <span>{formatDateTime(data.orderDate)}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", padding: "36px 56px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: 28,
            border: `2px solid ${C.cardBorder}`,
          }}
        >
          <span style={{ fontSize: 22, color: C.soft, fontWeight: 700 }}>Ditagihkan kepada</span>
          <span
            style={{
              fontSize: 32,
              color: C.inkStrong,
              fontWeight: 700,
              marginTop: 6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 900,
            }}
          >
            {data.customerName}
          </span>
          <span style={{ fontSize: 24, color: C.soft, marginTop: 4 }}>{data.customerWhatsapp}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            borderRadius: 24,
            overflow: "hidden",
            border: `2px solid ${C.cardBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: C.tableHead,
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 700,
              padding: "18px 24px",
            }}
          >
            <span style={{ flex: 3 }}>Nama Barang</span>
            <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
            <span style={{ flex: 2, textAlign: "right" }}>Total</span>
          </div>
          {data.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                fontSize: 26,
                padding: "16px 24px",
                backgroundColor: idx % 2 === 0 ? "#ffffff" : C.rowAlt,
                color: C.ink,
                borderTop: `1px solid ${C.cardBorder}`,
              }}
            >
              <div
                style={{
                  flex: 3,
                  display: "flex",
                  flexDirection: "column",
                  paddingRight: 16,
                }}
              >
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </span>
                {item.discount > 0 && (
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.accent, marginTop: 4 }}>
                    Diskon −{formatRupiah(item.discount)}
                  </span>
                )}
              </div>
              <span style={{ flex: 1, textAlign: "center" }}>{item.qty}</span>
              <span style={{ flex: 2, textAlign: "right", fontWeight: 700 }}>{formatRupiah(item.net)}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
            padding: "24px 28px",
            borderRadius: 20,
            backgroundColor: C.summaryBg,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: C.inkStrong }}>
            <span>Subtotal Barang</span>
            <span style={{ fontWeight: 700 }}>{formatRupiah(data.itemsSubtotal)}</span>
          </div>
          {hasDiscount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 26,
                color: C.inkStrong,
                marginTop: 10,
              }}
            >
              <span>Diskon</span>
              <span style={{ fontWeight: 700 }}>−{formatRupiah(data.itemsDiscount)}</span>
            </div>
          )}
          {hasShipping && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 26,
                color: C.inkStrong,
                marginTop: 10,
              }}
            >
              <span>Ongkos Kirim</span>
              <span style={{ fontWeight: 700 }}>{formatRupiah(data.shippingCost)}</span>
            </div>
          )}
          <div style={{ display: "flex", height: 2, backgroundColor: C.line, marginTop: 16, marginBottom: 14 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.inkStrong }}>Total Tagihan</span>
            <span style={{ fontFamily: "Baloo 2", fontSize: 38, fontWeight: 700, color: C.accent }}>
              {formatRupiah(data.total)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
            padding: 24,
            borderRadius: 20,
            backgroundColor: C.softBg,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: C.soft }}>Transfer Pembayaran ke</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: C.softInk, marginTop: 6 }}>{data.bankName}</span>
          <span style={{ fontSize: 30, color: C.softInk }}>{data.accountNumber}</span>
          <span style={{ fontSize: 24, color: C.soft }}>a/n {data.accountHolderName}</span>
        </div>

        {data.note && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
              padding: 20,
              borderRadius: 20,
              backgroundColor: C.noteBg,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: C.noteTitle }}>Catatan</span>
            <span style={{ fontSize: 24, color: C.noteInk, marginTop: 4 }}>{data.note}</span>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "28px 32px 40px 32px",
          backgroundColor: C.footerBg,
        }}
      >
        <span style={{ fontFamily: "Baloo 2", fontSize: 30, color: C.footerTitle, fontWeight: 700 }}>
          Terima kasih telah berbelanja.
        </span>
        <span style={{ fontSize: 22, color: C.soft, marginTop: 6 }}>
          Semoga Allah berkahi muamalah yang kita lakukan.
        </span>
      </div>
    </div>
  );

  const svg = await satori(markup, {
    width: WIDTH,
    fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })),
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  const pngData = resvg.render();
  return pngData.asPng();
}
