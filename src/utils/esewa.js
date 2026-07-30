// eSewa RC (test) environment payment utility
// Merchant code: EPAYTEST (eSewa test merchant)

export const ESEWA_CONFIG = {
  merchantCode: "EPAYTEST",
  gatewayUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  successUrl: `${window.location.origin}/order-success`,
  failureUrl: `${window.location.origin}/cart`,
};

/**
 * Generates a unique transaction UUID
 */
export function generateTransactionId() {
  return "ESEWA-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

/**
 * Creates the HMAC-SHA256 signature for eSewa
 * For demo/RC env we use a fixed test secret key
 */
export async function generateEsewaSignature(message) {
  // RC environment test secret key (provided by eSewa for testing)
  const secretKey = "8gBm/:&EnhH.1/q";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const base64Signature = btoa(String.fromCharCode(...hashArray));
  return base64Signature;
}

/**
 * Initiates eSewa payment via form POST
 */
export async function initiateEsewaPayment({ amount, taxAmount = 0, serviceCharge = 0, deliveryCharge = 0, orderId }) {
  const totalAmount = amount + taxAmount + serviceCharge + deliveryCharge;
  const transactionId = orderId || generateTransactionId();

  const message = `total_amount=${totalAmount},transaction_uuid=${transactionId},product_code=${ESEWA_CONFIG.merchantCode}`;
  const signature = await generateEsewaSignature(message);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = ESEWA_CONFIG.gatewayUrl;

  const fields = {
    amount: amount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    transaction_uuid: transactionId,
    product_code: ESEWA_CONFIG.merchantCode,
    product_service_charge: serviceCharge,
    product_delivery_charge: deliveryCharge,
    success_url: ESEWA_CONFIG.successUrl,
    failure_url: ESEWA_CONFIG.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: signature,
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  return transactionId;
}
