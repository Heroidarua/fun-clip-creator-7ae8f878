const PIX_KEY = "562cc2de-7775-4303-9ec5-866f19d9b2c0";
const MERCHANT_NAME = "Matheus Marinho";
const MERCHANT_CITY = "Sao Paulo";

const field = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, "0")}${value}`;

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const sanitize = (value: string, max: number) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);

/** Gera o código Pix "copia e cola" (BR Code) estático para doações. */
export const buildPixPayload = (amount: number, txid = "SOS01") => {
  const payload =
    field("00", "01") +
    field("26", field("00", "br.gov.bcb.pix") + field("01", PIX_KEY)) +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount.toFixed(2)) +
    field("58", "BR") +
    field("59", sanitize(MERCHANT_NAME, 25)) +
    field("60", sanitize(MERCHANT_CITY, 15)) +
    field("62", field("05", sanitize(txid, 25) || "***")) +
    "6304";

  return payload + crc16(payload);
};
