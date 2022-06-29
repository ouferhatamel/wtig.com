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
let unitPrice = 10.15;

// Stripe checkout
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  // Define unit price
  defineUnitPrice(data.oD["number of cards"]);

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
            amount: (10) * 100,
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
          unit_amount: 5 * 100, // 10000 = 100 USD
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
    unitPrice = 10.15;
  }
}


