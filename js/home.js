import { 
    db,
    doc,
    getDoc,
} from "./modules/firebaseSdk.js";

import { langObj } from "./modules/langages.js";

const langDropdown = document.querySelector(".mnFtr__lang h4");
const mangList = document.querySelector('.mnFtr__langList');

// Show langage list
langDropdown.addEventListener('click', () =>{
    mangList.classList.toggle('mnFtr__langList--visible');
    checkLangage();
}) 

// Check the selected langage
checkLangage();

// Translate to english
const eng = document.getElementById("mnFtr_eng");
eng.addEventListener('click', e => {
    // Change the local storage value
    let lang = "en";
    localStorage.setItem('selectedLang', lang);

    // Translate
    translate(lang);
});

// Translate to spanish
const esp = document.getElementById("mnFtr_esp");
esp.addEventListener('click', e => {
    // Change the local storage value
    let lang = "esp";
    localStorage.setItem('selectedLang', lang);

    // Translate
    translate(lang);
});

// Check card authenticity
const checkBtn = document.getElementById('checkAuth__checkBtn');
checkBtn.addEventListener('click', (e) => {

    // Get the input value
    const code = document.getElementById('checkAuth__input').value;

    if (code){
        // Check if card exists
    cardExists(code);
    } else {
        showNoCardMessage("Rellene el código de la tarjeta");
    }
    
});

// Functions

// Check if card exists
async function cardExists(code){
    
    const docRef = doc(db, "certified_cards", code);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        // Create the card object
        const cardObj = {
            "code": code,
            "card game": docSnap.data()['card game'],
            "card name": docSnap.data()['card name'],
            "card set": docSnap.data()['card set'],
            "certification langage": docSnap.data()['certification langage'],
            "card langage": docSnap.data()['card langage'],
            "certification date": docSnap.data()['certification date'],
            "grad": docSnap.data()['grad'],
            "corners": docSnap.data()['corners'],
            "edges": docSnap.data()['edges'],
            "surface": docSnap.data()['surface'],
            "centering": docSnap.data()['centering'],
        }

        // Store in local storage
        storeOnLocalStorage(cardObj);

        //redirect to certified card page
        location.href = "../check-authenticity.html";
        
    } else {
        showNoCardMessage("Esta tarjeta no existe, intente con otro código");
    }
}
// Store card data on local storage
function storeOnLocalStorage(cardData){
    const cardDataString = JSON.stringify(cardData);
    localStorage.setItem('cardData', cardDataString);
}
// Show no such card message
function showNoCardMessage(msg){
    // No such card
    const inputText = document.getElementById('checkAuth__checkBtn');
    inputText.textContent = msg;
    inputText.style.color = "red";

    // Remake the default text after 3 sec
    setTimeout(()=>{
        inputText.textContent = "¡COMPRUEBA LA AUTENTICIDAD DE TU CARTA!";
        inputText.style.color = "#202223";
    }, 3000);
}
// Check the selected langage
function checkLangage(){
    const lang = localStorage.getItem('selectedLang');
    if (lang == null)
        return;
    else
        translate(lang);
}
// Translate the page
function translate(lang){
    // Translate navigation bar and footer
    translateNavBarAndFooter(lang);

    // Translate the header
    const headlines = document.querySelectorAll('.heroDescription');
    headlines[0].querySelector("h1").innerHTML =langObj[lang]["home"]["h1S1"];
    headlines[1].querySelector("h1").innerHTML =langObj[lang]["home"]["h1S2"];
    headlines[2].querySelector("h1").innerHTML =langObj[lang]["home"]["h1S3"];
    headlines[3].querySelector("h1").innerHTML =langObj[lang]["home"]["h1S1"];
    headlines[0].querySelector("p").innerHTML =langObj[lang]["home"]["p01"];
    headlines[1].querySelector("p").innerHTML =langObj[lang]["home"]["p01"];
    headlines[2].querySelector("p").innerHTML =langObj[lang]["home"]["p01"];
    headlines[3].querySelector("p").innerHTML =langObj[lang]["home"]["p01"];
    document.querySelector('.hero__certifyBtn').textContent = langObj[lang]["home"]["cta"];

    // Translate the advantage section


    
    
}
function translateNavBarAndFooter(lang){
    // Translate the navBar
    const navLinks= document.querySelectorAll('.navBar__detailsLinks');
    const n0= navLinks[0].querySelectorAll("a");
    const n1= navLinks[1].querySelectorAll("a");

    n0[0].textContent = langObj[lang]["navBar"]["tarif"];
    n0[1].textContent = langObj[lang]["navBar"]["services"];
    n1[0].textContent = langObj[lang]["navBar"]["certify"];
    n1[2].textContent = langObj[lang]["navBar"]["myAccount"];
    n1[3].textContent = langObj[lang]["navBar"]["contact"];
    
    // Translate the footer
    const footerLinks = document.querySelectorAll(".mnFtr__links");
    const c1 = footerLinks[1].querySelector("ul").querySelectorAll("li");
    const c2 = footerLinks[2].querySelector("ul").querySelectorAll("li");
    const c3 = footerLinks[3].querySelector("ul").querySelectorAll("li");
    footerLinks[1].querySelector("h4").textContent = langObj[lang]["footer"]["help"];
    footerLinks[2].querySelector("h4").textContent = langObj[lang]["footer"]["myAccount"];
    footerLinks[3].querySelector("h4").textContent = langObj[lang]["footer"]["services"];
    footerLinks[4].querySelector("h4").textContent = langObj[lang]["footer"]["langage"];
    
    c1[0].textContent = langObj[lang]["footer"]["aboutUs"];
    c1[1].textContent = langObj[lang]["footer"]["tarif"];
    c1[3].textContent = langObj[lang]["footer"]["contact"];
    c2[0].textContent = langObj[lang]["footer"]["myAccount"];
    c2[1].textContent = langObj[lang]["footer"]["myOrders"];
    c3[0].textContent = langObj[lang]["footer"]["warranties"];
    c3[1].textContent = langObj[lang]["footer"]["certifyCard"];
    c3[2].textContent = langObj[lang]["footer"]["checkAuth"];
}