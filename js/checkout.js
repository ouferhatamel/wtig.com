import{auth, onAuthStateChanged, doc, setDoc,db, Timestamp }from "./modules/firebaseSdk.js";


// Get order information from local storage
const orderInfo= getOrderInfo();

// Fill recap info
fillRecap(orderInfo);

const confirmBtn = document.getElementById('orderInfo__payForm');
confirmBtn.addEventListener('submit', e =>{
    // TODO:: Create the checkout function

    e.preventDefault();


    //Get adress info
    const adressInfo = getAdress();

    // Get current user info
    getCurrentUser()
    .then(user =>{
        //Create the order data object to store on the orders collection
        const orderData = {
            "uid": user.uid,
            "email": user.email,
            "date": getDate(),
            "number of cards": orderInfo["number of cards"],
            "amount": orderInfo["amount"],
            "status": orderInfo["status"],
            "cards list": orderInfo["cards"],
            "adress": adressInfo
        };
        //Store data in the collection
        addOrder(orderData)
        .then(result =>{

            //Clear local storage
            localStorage.clear();

            // Redirect to success page
            location.href = "success-order.html"
        })

    })
    .catch(err => {
        console.log(err.message);
    });
});

// Functions

// Get current user info
function getCurrentUser(){
    return new Promise(resolve =>{
        onAuthStateChanged(auth, user => {
            if(user){
                
            }
            else{
                location.href = 'register.html';
            }
            resolve(user);
            
        });
    });
}
// Get order info drom local storage
function getOrderInfo(){

    const orderInfoString = localStorage.getItem('orderInfo');
    const orderInfo = JSON.parse(orderInfoString);
    console.log(orderInfo);

    return orderInfo;
}
// Get adress info
function getAdress(){
    const adressForm = document.getElementById('adressForm');
    return {
        "adress": adressForm['adress'].value,
        "complement": adressForm['complement'].value,
        "postal zip": adressForm['cp'].value,
        "city": adressForm['city'].value,
        "country": adressForm['county'].value,
        "tel": adressForm['tel'].value
    }

}
// Fill recap info
function fillRecap(orderInfo){
    const cardNumber = document.getElementById('recap__cardNumb');
    const unitPrice = document.getElementById('recap__cardsPrice');
    const deliveryPrice = document.getElementById('recap__delivery');
    const insurrancePrice = document.getElementById('recap__insurance');
    const amount = document.getElementById('recap__total');

    cardNumber.textContent = orderInfo["number of cards"] + "cartas";
    unitPrice.textContent = orderInfo["unit price"];
    deliveryPrice.textContent = 11.07;
    amount.textContent = orderInfo["amount"];
}
// Add order to orders collection
async function addOrder(docData){
    const orderRef = orderReference();
    await setDoc(doc(db, "orders", orderRef), docData);
}
// Calculate order reference (id)
function orderReference(){
    return new Date().getTime().toString();
}
// Get today date
function getDate(){
    let time = Timestamp.now().toDate();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return time.toLocaleDateString(undefined, options);
}
