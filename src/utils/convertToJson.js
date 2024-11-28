import superjson from "superjson";
/**
 * Ubah superjson ke json biasa
 * Alasan dibuat karena kita memiliki tipe BigInt di field-field pada tabel kita, jadi bentuknya jadi superjson
 * @param {*} value 
 * @returns 
 */
const convertToJson = (value) => {
  return JSON.parse(superjson.stringify(value)).json;
}

export default convertToJson;