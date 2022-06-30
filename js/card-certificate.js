// Print card data on certificate
printData();

//Functions

// Get card data rfom local storage
function getCartInfo(){

    const cardDataString = localStorage.getItem('cardData');
    const cardData = JSON.parse(cardDataString);

    return cardData;
}
// Print card data on the certificate
function printData(){
    // Get info from local storage
    const cardData = getCartInfo();

    document.getElementById('certificate__code').textContent = cardData.code;
    document.getElementById('certificate__note').textContent = cardData.grad;
    document.getElementById('certificate__cGame').textContent = cardData["card game"];
    document.getElementById('certificate__cName').textContent = cardData["card name"];
    document.getElementById('certificate__cSet').textContent = cardData["card set"];
    document.getElementById('certificate__cCLang').textContent = cardData["certification langage"];
    document.getElementById('certificate__cLang').textContent = cardData["card langage"];
    document.getElementById('certificate__date').textContent = cardData["certification date"];

}