import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NASDAQ_LISTED_URL =
  "https://www.nasdaqtrader.com/dynamic/symdir/nasdaqlisted.txt";
const OTHER_LISTED_URL =
  "https://www.nasdaqtrader.com/dynamic/symdir/otherlisted.txt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, "../public/tickers.json");

function parsePipeTable(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headerCells = lines[0].split("|").map((cell) => cell.trim());

  const rows = lines.slice(1).filter((line) => !line.startsWith("File Creation Time"));
  return rows.map((row) => {
    const cells = row.split("|").map((cell) => cell.trim());

    const getValue = (header) => {
      const index = headerCells.indexOf(header);
      return index >= 0 ? (cells[index] ?? "") : "";
    };

    const symbol = getValue("Symbol") || getValue("ACT Symbol");
    const name = getValue("Security Name") || getValue("Company Name");
    const exchange = getValue("Exchange") || undefined;
    const etfFlag = getValue("ETF");

    return { symbol, name, exchange, etfFlag };
  });
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.text();
}

function normalizeTickerRows(rows) {
  const deduped = new Map();
  const commonStockRegex = /(common stock|common shares|ordinary shares)/i;

  for (const row of rows) {
    const symbol = row.symbol.trim().toUpperCase();
    const name = row.name.trim();
    const etfFlag = row.etfFlag?.trim().toUpperCase();

    if (!symbol || !name || symbol === "SYMBOL") {
      continue;
    }

    if (etfFlag === "Y" || /\betf\b/i.test(name)) {
      continue;
    }

    if (!commonStockRegex.test(name)) {
      continue;
    }

    const normalized = row.exchange
      ? { symbol, name, exchange: row.exchange.trim() }
      : { symbol, name };

    if (!deduped.has(symbol)) {
      deduped.set(symbol, normalized);
    }
  }

  return Array.from(deduped.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
}

async function main() {
  const [nasdaqText, otherText] = await Promise.all([
    fetchText(NASDAQ_LISTED_URL),
    fetchText(OTHER_LISTED_URL)
  ]);

  const parsedRows = [...parsePipeTable(nasdaqText), ...parsePipeTable(otherText)];
  const tickers = normalizeTickerRows(parsedRows);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(tickers, null, 2)}\n`, "utf8");

  console.log(`Tickers written: ${tickers.length}`);
  console.log(`Output: ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
