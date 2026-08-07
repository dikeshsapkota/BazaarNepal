// eSewa RC (test) environment payment utility

export const ESEWA_CONFIG = {
  merchantCode: "EPAYTEST",
  gatewayUrl:
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  successUrl: `${window.location.origin}/order-success`,
  failureUrl: `${window.location.origin}/cart`,
};

export function generateTransactionId() {
  return (
    "ESEWA-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()
  );
}

export async function generateEsewaSignature(message) {
  const secretKey = "8gBm/:&EnhH.1/q";

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );

  const hashArray = Array.from(
    new Uint8Array(signature)
  );

  return btoa(
    String.fromCharCode(...hashArray)
  );
}

export async function initiateEsewaPayment({
  amount,
  taxAmount = 0,
  serviceCharge = 0,
  deliveryCharge = 0,
  orderId,
}) {
  const totalAmount =
    Number(amount) +
    Number(taxAmount) +
    Number(serviceCharge) +
    Number(deliveryCharge);

  const transactionId =
    orderId || generateTransactionId();

  const message =
    `total_amount=${totalAmount},` +
    `transaction_uuid=${transactionId},` +
    `product_code=${ESEWA_CONFIG.merchantCode}`;

  const signature =
    await generateEsewaSignature(message);

  const form = document.createElement("form");

  form.method = "POST";
  form.action = ESEWA_CONFIG.gatewayUrl;


  const fields = {
    amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    transaction_uuid: transactionId,
    product_code: ESEWA_CONFIG.merchantCode,
    product_service_charge: serviceCharge,
    product_delivery_charge: deliveryCharge,
    success_url: ESEWA_CONFIG.successUrl,
    failure_url: ESEWA_CONFIG.failureUrl,
    signed_field_names:
      "total_amount,transaction_uuid,product_code",
    signature,
  };

  Object.entries(fields).forEach(
    ([key, value]) => {
      const input =
        document.createElement("input");

      input.type = "hidden";
      input.name = key;
      input.value = String(value);

      form.appendChild(input);
    }
  );
console.log("ESEWA FIELDS:", fields);
console.log("SIGN MESSAGE:", message);
console.log("SIGNATURE:", signature);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  return transactionId;
}