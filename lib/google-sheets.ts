import "server-only";
import { google, type sheets_v4 } from "googleapis";
import type { OrderRecord } from "@/lib/order-schema";

export const SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Delivery Zone",
  "Delivery Fee",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
] as const;

const SHEET_COLUMN_WIDTHS = [
  175, 145, 165, 135, 220, 260, 250, 90, 135, 165, 120, 135, 165, 160, 240,
] as const;

const STATUS_STYLES = [
  { status: "New Order", background: { red: 1, green: 0.949, blue: 0.827 }, foreground: { red: 0.545, green: 0.404, blue: 0 } },
  { status: "Order Confirmed", background: { red: 0.89, green: 0.949, blue: 1 }, foreground: { red: 0.043, green: 0.31, blue: 0.553 } },
  { status: "Order Ongoing", background: { red: 0.925, green: 0.902, blue: 1 }, foreground: { red: 0.286, green: 0.176, blue: 0.62 } },
  { status: "Delivered", background: { red: 0.89, green: 0.965, blue: 0.914 }, foreground: { red: 0.098, green: 0.443, blue: 0.231 } },
  { status: "Cancelled", background: { red: 1, green: 0.91, blue: 0.91 }, foreground: { red: 0.62, green: 0.094, blue: 0.094 } },
] as const;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function quotedTab(tab: string) {
  return `'${tab.replaceAll("'", "''")}'`;
}

async function getSheetsClient() {
  const privateKey = required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureSheetReady() {
  const sheets = await getSheetsClient();
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = required("GOOGLE_SHEET_TAB_NAME");
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  let tab = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === tabName);

  if (!tab) {
    const createResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
    });
    const properties = createResponse.data.replies?.[0]?.addSheet?.properties;
    if (properties?.sheetId == null) {
      throw new Error(`Google Sheet tab "${tabName}" could not be created.`);
    }
    tab = { properties, bandedRanges: [], conditionalFormats: [] };
  }

  const sheetId = tab.properties?.sheetId;
  if (sheetId == null) throw new Error(`Google Sheet tab "${tabName}" is unavailable.`);
  const rowCount = Math.max(tab.properties?.gridProperties?.rowCount ?? 1000, 1000);

  const range = `${quotedTab(tabName)}!A1:O1`;
  const headerResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const currentHeaders = headerResponse.data.values?.[0] ?? [];

  if (currentHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
  } else if (SHEET_HEADERS.some((header, index) => currentHeaders[index] !== header)) {
    throw new Error("The Google Sheet headers do not match the expected order. See README.md for the exact columns.");
  }

  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 44 },
        fields: "pixelSize",
      },
    },
    ...SHEET_COLUMN_WIDTHS.map((pixelSize, index) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    })),
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.027, green: 0.071, blue: 0.149 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 15 },
        cell: {
          userEnteredFormat: {
            textFormat: { foregroundColor: { red: 0.067, green: 0.094, blue: 0.153 }, fontSize: 10 },
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(textFormat,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 14, endColumnIndex: 15 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP" } },
        fields: "userEnteredFormat.wrapStrategy",
      },
    },
    ...[8, 10, 11].map((columnIndex) => ({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: columnIndex, endColumnIndex: columnIndex + 1 },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: "NUMBER", pattern: '"NPR" #,##0' },
            horizontalAlignment: "RIGHT",
          },
        },
        fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
      },
    })),
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 13, endColumnIndex: 14 },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: STATUS_STYLES.map(({ status }) => ({ userEnteredValue: status })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 15 } },
      },
    },
  ];

  if (!tab.bandedRanges?.length) {
    requests.push({
      addBanding: {
        bandedRange: {
          range: { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: 15 },
          rowProperties: {
            headerColor: { red: 0.027, green: 0.071, blue: 0.149 },
            firstBandColor: { red: 1, green: 1, blue: 1 },
            secondBandColor: { red: 0.965, green: 0.973, blue: 0.984 },
          },
        },
      },
    });
  }

  if (!tab.conditionalFormats?.length) {
    STATUS_STYLES.forEach(({ status, background, foreground }, index) => {
      requests.push({
        addConditionalFormatRule: {
          index,
          rule: {
            ranges: [{ sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 13, endColumnIndex: 14 }],
            booleanRule: {
              condition: { type: "TEXT_EQ", values: [{ userEnteredValue: status }] },
              format: {
                backgroundColor: background,
                textFormat: { foregroundColor: foreground, bold: true },
              },
            },
          },
        },
      });
    });
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });

  return { sheets, spreadsheetId, tabName };
}

export async function saveOrderToSheet(order: OrderRecord) {
  const { sheets, spreadsheetId, tabName } = await ensureSheetReady();
  const idColumn = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quotedTab(tabName)}!A2:A`,
  });
  const alreadyExists = idColumn.data.values?.some((row) => row[0] === order.orderId) ?? false;

  if (alreadyExists) return { alreadyExists: true };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quotedTab(tabName)}!A:O`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        order.orderId,
        order.dateTime,
        order.customerName,
        order.phone,
        order.email,
        order.location,
        order.productName,
        order.quantity,
        order.pricePerPiece,
        order.deliveryZone,
        order.deliveryFee,
        order.totalPrice,
        order.paymentMethod,
        order.orderStatus,
        order.notes,
      ]],
    },
  });

  return { alreadyExists: false };
}
