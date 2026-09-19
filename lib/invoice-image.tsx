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

export type InvoiceData = {
  storeName: string;
  logoDataUrl: string | null;
  invoiceNumber: string;
  orderDate: Date;
  customerName: string;
  customerWhatsapp: string;
  items: { name: string; qty: number; total: number }[];
  total: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  note: string | null;
};

const WIDTH = 1080;

export async function renderInvoicePng(data: InvoiceData): Promise<Buffer> {
  const fonts = loadFonts();

  const rowHeight = 66;
  const baseHeight = 1130;
  const noteLines = data.note ? Math.max(1, Math.ceil(data.note.length / 48)) : 0;
  const noteHeight = data.note ? 40 + 30 * noteLines : 0;
  const height = baseHeight + data.items.length * rowHeight + noteHeight;

  const markup = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: WIDTH,
        height,
        backgroundColor: "#fffaf3",
        fontFamily: "Nunito",
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "48px 56px 32px 56px",
          background: "linear-gradient(135deg, #ff2d96 0%, #fc5c2e 100%)",
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
            border: "2px solid #ffe0ef",
          }}
        >
          <span style={{ fontSize: 22, color: "#8258f7", fontWeight: 700 }}>Ditagihkan kepada</span>
          <span
            style={{
              fontSize: 32,
              color: "#7d0f46",
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
          <span style={{ fontSize: 24, color: "#8258f7", marginTop: 4 }}>{data.customerWhatsapp}</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            borderRadius: 24,
            overflow: "hidden",
            border: "2px solid #ffe0ef",
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#ff2d96",
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
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fff5fa",
                color: "#5a2350",
                borderTop: "1px solid #ffe0ef",
              }}
            >
              <span style={{ flex: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.name}
              </span>
              <span style={{ flex: 1, textAlign: "center" }}>{item.qty}</span>
              <span style={{ flex: 2, textAlign: "right", fontWeight: 700 }}>{formatRupiah(item.total)}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            padding: "22px 28px",
            borderRadius: 20,
            backgroundColor: "#ffe0ef",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "#7d0f46" }}>Total Tagihan</span>
          <span style={{ fontFamily: "Baloo 2", fontSize: 38, fontWeight: 700, color: "#c60d68" }}>
            {formatRupiah(data.total)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
            padding: 24,
            borderRadius: 20,
            backgroundColor: "#f5f2ff",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: "#582fb8" }}>Transfer Pembayaran ke</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#3a2274", marginTop: 6 }}>{data.bankName}</span>
          <span style={{ fontSize: 30, color: "#3a2274" }}>{data.accountNumber}</span>
          <span style={{ fontSize: 24, color: "#6c3ce0" }}>a/n {data.accountHolderName}</span>
        </div>

        {data.note && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
              padding: 20,
              borderRadius: 20,
              backgroundColor: "#fff4f0",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: "#c13615" }}>Catatan</span>
            <span style={{ fontSize: 24, color: "#7c2716", marginTop: 4 }}>{data.note}</span>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "28px 32px 40px 32px",
          backgroundColor: "#fdf0f5",
        }}
      >
        <span style={{ fontFamily: "Baloo 2", fontSize: 28, color: "#ec1580", fontWeight: 700 }}>
          Terima kasih sudah belanja!
        </span>
        <span style={{ fontSize: 20, color: "#8258f7", marginTop: 4 }}>Sampai jumpa di pesanan berikutnya</span>
      </div>
    </div>
  );

  const svg = await satori(markup, {
    width: WIDTH,
    height,
    fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: "normal" as const })),
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  const pngData = resvg.render();
  return pngData.asPng();
}
