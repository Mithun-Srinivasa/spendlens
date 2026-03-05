/**
 * parseCSV.ts
 *
 * Converts raw CSV text from Indian bank statements into a clean,
 * human-readable format that Gemini can reliably parse.
 *
 * Supported banks: HDFC, ICICI, SBI, Axis, Kotak, and generic formats.
 * Gemini handles the semantic categorization; this module just cleans structure.
 */

/** Parses a single CSV line handling quoted fields with embedded commas */
function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            // Handle escaped quotes ("")
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result;
}

/** Find the index of the header row (first row with date/amount keywords) */
function findHeaderRow(lines: string[]): number {
    const keywords = [
        "date",
        "narration",
        "description",
        "particulars",
        "remarks",
        "debit",
        "credit",
        "withdrawal",
        "deposit",
        "amount",
        "balance",
    ];

    for (let i = 0; i < Math.min(15, lines.length); i++) {
        const lower = lines[i].toLowerCase();
        const matchCount = keywords.filter((k) => lower.includes(k)).length;
        if (matchCount >= 2) return i;
    }
    return 0;
}

/** Strip common noise from transaction descriptions */
function cleanDescription(desc: string): string {
    return desc
        .replace(/\s+/g, " ")
        .replace(/['"]/g, "")
        .trim()
        .substring(0, 120); // Cap description length
}

/** Main parser — returns a clean text summary for Gemini */
export function parseCSV(raw: string): string {
    // Normalize line endings
    const lines = raw
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length < 2) {
        return raw; // Not enough data, return as-is
    }

    const headerIdx = findHeaderRow(lines);
    const headers = splitCSVLine(lines[headerIdx]).map((h) =>
        h.replace(/['"]/g, "").trim()
    );

    if (headers.length === 0) {
        return raw;
    }

    const rows: string[] = [];
    let skipped = 0;

    for (let i = headerIdx + 1; i < lines.length; i++) {
        const cells = splitCSVLine(lines[i]);

        // Skip rows that are clearly not transactions (total rows, blank rows, etc.)
        const joined = cells.join("").replace(/[\s,0.]/g, "");
        if (joined.length < 3) {
            skipped++;
            continue;
        }

        // Build a key-value pair string for this row
        const parts: string[] = [];
        for (let j = 0; j < Math.min(headers.length, cells.length); j++) {
            const header = headers[j];
            const value = cleanDescription(cells[j]);
            if (header && value && value !== "-" && value !== "N/A") {
                parts.push(`${header}: ${value}`);
            }
        }

        if (parts.length >= 2) {
            rows.push(parts.join(" | "));
        }
    }

    if (rows.length === 0) {
        // Fallback: return cleaned raw text
        return lines.join("\n");
    }

    const summary = [
        `Bank Statement — ${rows.length} transactions`,
        `Columns: ${headers.join(", ")}`,
        "",
        ...rows,
    ].join("\n");

    return summary;
}
