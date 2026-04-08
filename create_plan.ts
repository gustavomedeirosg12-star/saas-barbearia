const MP_ACCESS_TOKEN = "APP_USR-146883498266239-040801-f16b98b039ca4ffd0c3a529149f32e63-483253652";

async function createPlan() {
  const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason: "Plano Pro - ClientFlow",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 49.90,
        currency_id: "BRL"
      },
      back_url: "https://ais-pre-p6ekfr2ol5i4lbln5wlf74-513283967952.us-east1.run.app"
    })
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
createPlan();
