// eSewa RC (test) environment payment utility

export const ESEWA_CONFIG = {
  merchantCode:
    import.meta.env.VITE_ESEWA_MERCHANT_CODE || "EPAYTEST",

  secretKey:
    import.meta.env.VITE_ESEWA_SECRET_KEY,

  gatewayUrl:
    import.meta.env.VITE_ESEWA_GATEWAY_URL ||
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
  const secretKey = ESEWA_CONFIG.secretKey;

  if (!secretKey) {
    throw new Error(
      "VITE_ESEWA_SECRET_KEY is missing from .env.local"
    );
  }

  const encoder = new TextEncoder();

  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey =
    await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

  const signature =
    await window.crypto.subtle.sign(
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
  try {
    const baseAmount = Number(amount);
    const tax = Number(taxAmount);
    const service = Number(serviceCharge);
    const delivery = Number(deliveryCharge);

    if (
      Number.isNaN(baseAmount) ||
      baseAmount <= 0
    ) {
      throw new Error(
        "Invalid eSewa payment amount"
      );
    }

    const totalAmount =
      baseAmount +
      tax +
      service +
      delivery;

    const transactionId =
      orderId || generateTransactionId();

    /*
      IMPORTANT:
      This exact order must be maintained.
    */
    const message =
      `total_amount=${totalAmount},` +
      `transaction_uuid=${transactionId},` +
      `product_code=${ESEWA_CONFIG.merchantCode}`;

    const signature =
      await generateEsewaSignature(message);

    const fields = {
      amount: String(baseAmount),

      tax_amount: String(tax),

      total_amount: String(totalAmount),

      transaction_uuid:
        transactionId,

      product_code:
        ESEWA_CONFIG.merchantCode,

      product_service_charge:
        String(service),

      product_delivery_charge:
        String(delivery),

      success_url:
        ESEWA_CONFIG.successUrl,

      failure_url:
        ESEWA_CONFIG.failureUrl,

      signed_field_names:
        "total_amount,transaction_uuid,product_code",

      signature,
    };

    console.log(
      "========== ESEWA PAYMENT =========="
    );

    console.log(
      "ESEWA FIELDS:",
      fields
    );

    console.log(
      "SIGN MESSAGE:",
      message
    );

    console.log(
      "TRANSACTION ID:",
      transactionId
    );

    console.log(
      "TOTAL AMOUNT:",
      totalAmount
    );

    console.log(
      "==================================="
    );

    const form =
      document.createElement("form");

    form.method = "POST";
    form.action =
      ESEWA_CONFIG.gatewayUrl;

    form.style.display = "none";

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

    document.body.appendChild(form);

    form.submit();

    return transactionId;
  } catch (error) {
    console.error(
      "eSewa payment initiation failed:",
      error
    );

    throw error;
  }
}