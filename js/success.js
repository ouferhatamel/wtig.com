import{auth, onAuthStateChanged, doc, setDoc,db, Timestamp}from "./modules/firebaseSdk.js";


// Get order information from local storage
const orderInfo= getOrderInfo();

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
        "adress": orderInfo["adress"]
    };
    //Store data in the collection
    addOrder(orderData)
    .then(result =>{

        //Clear local storage
        localStorage.clear();
    })

})
.catch(err => {
    console.log(err.message);
});

//Functions

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
// Get today date
function getDate(){
    let time = Timestamp.now().toDate();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return time.toLocaleDateString(undefined, options);
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