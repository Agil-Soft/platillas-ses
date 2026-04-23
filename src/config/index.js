const AWS_REGION = process.env.AWS_REGION || "us-east-2";

const TEST_FROM_EMAIL_ADDRESS = "Centro de Notificaciones <no-reply@getAgil.com>";
const TEST_TO_EMAIL_ADDRESSES = [
  "matias.lara@getagil.com",
  "jose.flores@getagil.com",
  "raul@getagil.com",
];
const TEST_REPLY_TO_EMAIL = ["Soporte Clientes <ayuda@getagil.com>"];

module.exports = {
  AWS_REGION,
  TEST_FROM_EMAIL_ADDRESS,
  TEST_TO_EMAIL_ADDRESSES,
  TEST_REPLY_TO_EMAIL,
};