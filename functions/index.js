const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
  // get user and add admin custom claim
  return admin.auth().getUserByEmail(data.email).then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
  }).then(() => {
    return {
      message: `Success! ${data.email} has been made an admin.`,
    };
  }).catch((err) => {
    return err;
  });
});

// Remove admin role
exports.removeAdminRole = functions.https.onCall((data, context) => {
  // get user and add admin custom claim
  return admin.auth().getUserByEmail(data.email).then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: null,
    });
  }).then(() => {
    return {
      message: `Success! Admin role removed from ${data.email}.`,
    };
  }).catch((err) => {
    return err;
  });
});

// Global variables declaration
let unitPrice = 12;
let delivery = 0;

// Stripe checkout
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  // Define unit price
  defineUnitPrice(data.oD["number of cards"]);

  // Define the delivery price
  defineDeliveryPrice(data.oD["number of cards"]);

  // Define the insurance price
  const insurance = defineInsurancePrice(data.oD);

  // Create a checkout session
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: "http://localhost:5500/success-order.html",
    cancel_url: "http://localhost:5500/submit-card.html",

    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.round(delivery * 100),
            currency: "eur",
          },
          display_name: "Entrega",
        },
      },
    ],
    line_items: [
      // Cards price
      {
        quantity: data.oD["number of cards"],
        price_data: {
          currency: "eur",
          unit_amount: Math.round(unitPrice * 100), // 10000 = 100 USD
          product_data: {
            name: "Cards",
          },
        },
      },
      // Insurance price
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: insurance * 100, // 10000 = 100 USD
          product_data: {
            name: "Insurance",
          },
        },
      },
    ],
  });
  return {
    id: session.id,
  };
});

/**
 * Defines the unit price.
 * @param {int} quantity is the number of cards ordered.
 */
function defineUnitPrice(quantity) {
  if (quantity >= 10) {
    unitPrice = 9.95;
    if (quantity >= 20) {
      unitPrice = 9.50;
      if (quantity >=50) {
        unitPrice = 8.95;
      }
    }
  } else {
    unitPrice = 12;
  }
}
/**
 * Defines the insurance price.
 * @param {object} orderObj is the order object sent from client side.
 * @return {insurance} the insurance price.
 */
function defineInsurancePrice(orderObj) {
  let total = 0;
  const cards = orderObj["cards"];

  for (const key in cards) {
    if (Object.prototype.hasOwnProperty.call(cards, "key")) continue;
    const obj = cards[key]["card value"];
    total = total + Number(obj);
  }

  const insurance = (total * 0.056);

  return insurance;
}
/**
 * Defines the insurance price.
 * @param {int} numberCards is the number of ordered cards.
 * @return {delivery} is the delivery price.
 */
function defineDeliveryPrice(numberCards) {
  // The number of a group of 20 cards -> 4 boxes -> group of 2 kg
  const groupNumber = Math.floor(numberCards / 20);

  // number of cards from 1 to 20 (after the 20*n group)
  const nbCrd = numberCards - (groupNumber * 20);

  if (numberCards == 0) {
    delivery = 0;
  } else {
    if (nbCrd == 0) {
      delivery = 26 * groupNumber;
    }
    if (nbCrd <= 5 && nbCrd > 0) {
      delivery = 26 * groupNumber + 11.7;
    } else if (nbCrd > 5 && nbCrd <= 10) {
      delivery = 26 * groupNumber + 18.1;
    } else if (nbCrd > 10 && nbCrd <= 20) {
      delivery = 26 * groupNumber + 26;
    }
  }
  return delivery;
}


