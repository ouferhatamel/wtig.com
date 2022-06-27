import { functions, httpsCallable, auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    db, query, where, getDocs, addDoc,
    collection,
    doc, signOut, deleteDoc, setDoc,
    updateDoc, getDoc, updatePassword, EmailAuthProvider,
    reauthenticateWithCredential,

} from "./modules/firebaseSdk.js";

 //Authentication states
 onAuthStateChanged(auth, user => {

     //Check if user is logged in
    if(user){
        //Check if user has admin role
        checkAdminRole(user);
    }
    else{
        //Show login modal
        showLogin();
    }
});

//Admin login
const loginForm = document.getElementById('login__form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //Sign-in the user
    signInUser(auth);
});

//Update profile
const updateProfileForm = document.getElementById('update__form');
updateProfileForm.addEventListener('submit', updateAdminProfile);

//Add admin account
const addForm = document.getElementById('accounts__form');
addForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Launch the loader
    displayLoader('block', 'accounts__addAdminLoader');
    //Make a user an admin
    const email = addForm['adminEmail'].value;
    const addAdminRole = httpsCallable(functions, 'addAdminRole');
    addAdminRole({ email: email})
    .then(result => {
        console.log(result);
        //Check if user exists on admins collection, if no, then add it
        checkAdminExists()
        .then((flag)=>{
            if(!flag){
                addAdminUser(email)
                .then(()=>{
                    //Get a snapshot of the admin users collection
                    snapshotAdmins();
                    //Stop the loader
                    displayLoader('none', 'accounts__addAdminLoader');
                    //Reset form
                    addForm.reset();
                });
            }
        });
    })
    .catch(err => {
        //Stop the loader
        displayLoader('none', "accounts__addAdminLoader");
        //Show the error
        showError(err.code, 'admin__error');
        
    });
});

//Show and hide the add certified card form
const showCForm = document.querySelector('.certifiedCards__addBtn')
const ccList = document.querySelector('.certifiedCards__list');
showCForm.addEventListener('click', (e) => {
    ccList.style.display = 'none';
    certifiedCForm.style.display = 'block';
    e.target.style.display = 'none';
});

//Close the certified card form
const closeCForm =document.getElementById('certifiedCard_cancelBtn');
closeCForm.addEventListener('click', (e)=>{
    ccList.style.display = 'block';
    certifiedCForm.style.display = 'none';
    showCForm.style.display = 'block';
})

//Add a certified card
const certifiedCForm = document.getElementById('certifiedCards__form');
certifiedCForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //Launch the loader
    displayLoader('block', 'certifiedCard__loader');

    //Store data on the Certified cards collection
    addCertifiedCard()
    .then((data)=>{
        //Stop loader
        displayLoader('none', 'certifiedCard__loader');

        //Get data from Certified cards collection
        snapshotCertifiedCards()
        .then((result)=>{
            //Show the certified cards list
            displayCardsList();
        });
    })
    .catch(err =>{
        //Stop loader
        displayLoader('none', 'certifiedCard__loader');
        //Show error message
        console.log(err.message);
    })
});

//Logout user
const logout = document.querySelector('.dashboard__signup');
logout.addEventListener('click', logOut);

//Toggle between sections
//TODO: Create a function
const menuItems = document.querySelectorAll('.dashbord__menuList li');
menuItems.forEach((item) => {
    item.addEventListener('click', (e) => {
        let section = e.target.getAttribute('id');
        const sectionHeader = document.querySelector('.dashboard__header');

        switch (section) {
            case 'profileSec' :
                selectedMenuItem(e.target);
                showSection('dashboard__profile');
                sectionHeader.textContent = 'Perfil';
                break;
            case 'accountsSec' :
                selectedMenuItem(e.target);
                showSection('dashboard__accounts');
                sectionHeader.textContent = 'Cuentas';
                snapshotAdmins();
                break;
            case 'ordersSec' :
                selectedMenuItem(e.target);
                showSection('dashboard__orders');
                sectionHeader.textContent = 'Pedidos';
                snapshotOrders();
                break;
            case 'ccSec' :
                selectedMenuItem(e.target);
                showSection('dashboard__certifiedCards');
                sectionHeader.textContent = 'Tarjetas certificadas';
                snapshotCertifiedCards();
                break;
        }
    })
});

//////////////////////////////////////
//Functions//////////////////////////
////////////////////////////////////
//Show section
function showSection(id){
    const sections = document.querySelectorAll('.dashboard__section');
    const section = document.getElementById(`${id}`);

    //Hide all sections
    sections.forEach((section) => {
        section.style.display = 'none';
    });

    //Show the selected sections
    section.style.display = 'flex';
}
//Style the selected menu item
function selectedMenuItem(e){
    menuItems.forEach(item => {
        item.classList.remove('selected');
    })
    e.classList.add('selected');
}
//Show dashboard
function showDashboard(){
    const dashboard = document.getElementById('admin__dashboard');
    dashboard.style.display = 'flex';
}
//Show login
function showLogin(){
    const loginModal = document.getElementById('admin__login');
    loginModal.style.display = 'flex';
}
//Hide dashboard
function hideDashboard(){
    const dashboard = document.getElementById('admin__dashboard');
    dashboard.style.display = 'none';
}
//Sign-in user
function signInUser(auth){

    //Launch the loader
    displayLoader('block', 'login__loader');

    //Get user infos
    const email = loginForm['loginEmail'].value;
    const pwd = loginForm['loginPwd'].value;

    //Sign in the user
    signInWithEmailAndPassword(auth, email, pwd)
    .then((cred) => {
        console.log('logged in');
        //Stop the loader
        displayLoader('none', 'login__loader');
        //Reload the page
        location.reload();
    })
    .catch(err => {
        //Stop loader
        displayLoader('none', 'login__loader');
        //Show the error
        showError(err.code, "login__error");
    });
}
// Get current user
function getCurrentUser(){
    return new Promise(resolve =>{
        onAuthStateChanged(auth, user => {
            if(user){
            }
            resolve(user);
        });
    });
  }
// Update admin profile
function updateAdminProfile(e){
    e.preventDefault();

    //Launch loader
    displayLoader('block', 'accounts__profileLoader');
    //Update the profile after getting uid
    getCurrentUser().then(user => {
    //Check user validity - Re-authentification
    reAuthUser(user);
  });
}
//Define user credencials
function promptForCredentials(email, pwd){
    const credential = EmailAuthProvider.credential(
      email,
      pwd
    );
    return credential;
  }
//Reauthentificate user
function reAuthUser(user){

    const email = updateProfileForm['profileEmail'].value;
    const pwd = updateProfileForm['profilepwd'].value;
    //Get user credentials
    const credential = promptForCredentials(email,pwd);
  
    reauthenticateWithCredential(user, credential).then(() => {
      // User re-authenticated.
      console.log('User re-authenticated !');
      //Update the profile
      updatePwd(user);
    }).catch((err) => {
        
        //Stop loader
        displayLoader('none', 'accounts__profileLoader');

        //Show error
        showError(err.code, "profile__error");
        console.log('An error occured when trying re-authenticated the user', err.message);
    });
  }
//Update password 
function updatePwd(user){

    //Getting the new password value
    const n_pwd = updateProfileForm['nProfilepwd'].value;
  
    updatePassword(user, n_pwd).then(() => {
        //Stop loader
        displayLoader('none', 'accounts__profileLoader');
        //Show a message
        showSuccess('Password updated !', 'profile__error');
        console.log('password updated');
    })
    .catch((err) => {
        displayLoader('none', 'accounts__profileLoader');
        showError(err.code, 'profile__error');
        console.log('Error: ', err.message);
    });
}
//Logout user
function logOut(){
    signOut(auth)
      .then(()=>{
          hideDashboard();
          showLogin();
      }).catch(err => {
          console.log(err.message);
      })
}
//Add user to admins collection
async function checkAdminExists(){
    //TODO: Create a function that looks for that user where
    //email is input.value and get all its infos
  
    let flag = false;
    const email = addForm['adminEmail'].value;

    const docs = await getDocs(collection(db, "admins"));
    docs.forEach((doc) => {
        if(doc.data().email == email){
            flag = true;
            //Stop loader
            displayLoader('none', 'accounts__addAdminLoader');
            //Show a error message
            showError('Este usuario ya es un administrador', 'admin__error');
        }
    });
    return flag;
}
//Check if user has admin role
function checkAdminRole(user){

    user.getIdTokenResult()
    .then(idTokenResult => {

        //Check if user has admin role
        user.admin = idTokenResult.claims.admin;
        if(user.admin){
            //Show admin dashboard
            showDashboard();
        }else{
            //Show the login modal
            showLogin();
            //Show error on the default error
            showError('Usted no es un administrador', 'login__error');
        }
    });
}
//Get all admins list from collection
async function snapshotAdmins(){
    const adminList = document.querySelector('.accounts__list');
    adminList.innerHTML = `
        <li class="list__header">
            <span>Email</span>
            <span>Papel</span>
            <span>Eliminar el admin</span>
        </li>
    `;
    const docs = await getDocs(collection(db, "admins"));

    docs.forEach((doc) => {
        //Display admin users collection data     
        const account = document.createElement('li');
        account.innerHTML = `
            <span>${doc.data().email}</span>
            <span>Administrateur</span>
            <span class="deleteAdmin"><img src='images/icons/wytgrd-delete-icon.svg'></span>
            `
        adminList.append(account);
    });

    //Remove admin role from user
    const deleteBtns = document.querySelectorAll('.deleteAdmin');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', removeAdmin);
    });
}
//Add user to admins collection
async function addAdminUser(email){
    //Add to admins collection
    const docRef = await addDoc(collection(db, "admins"), {
        email: email,
    });
}
//function show error message
function showError(msg, errBlocId){
    const errElement = document.getElementById(errBlocId);
    errElement.style.display = 'block';
    errElement.textContent = msg;
    //remove the message after 3 seconds
    setTimeout(()=>{
        errElement.style.display = 'none';
    }, 3000);
}
//function show success message
function showSuccess(msg, errBlocId){
    const errElement = document.getElementById(errBlocId);
    errElement.style.display = 'block';
    errElement.textContent = msg;
    errElement.style.backgroundColor = '#97cf8a'
    errElement.style.color = 'green';
    //remove the message after 3 seconds
    setTimeout(()=>{
        errElement.style.display = 'none';
    }, 3000);
}
//Remove admin
async function removeAdmin(e){

    const email = e.currentTarget.parentElement.firstElementChild.textContent;
    const icn = e.currentTarget.firstElementChild;
    //Launch Loader
    icn.setAttribute("src", "images/others/wytgrd-loader-gif.gif");
    icn.style.width = '6rem';
    //Remove Admin role from the user
    const removeAdminRole = httpsCallable(functions, 'removeAdminRole');
    removeAdminRole({ email: email})
    .then(result => {
        console.log(result);
        //Query the selected user and delete it from admins collection
        queryAdminsCollection(email);
        //Stop loader

    });
}
//Search the selected user by its email
async function queryAdminsCollection(email){

    //Query the collection for document with the selected email
    const adminsRef = collection (db, "admins");
    const q = query(adminsRef, where("email", "==", email));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        //Delete user doc from admins
        deleteUFromAdmins(doc.id);
        console.log('user doc deleted !');
        //Display the admins list
        snapshotAdmins();
    });
}
//Delete the user document from admins collection
async function deleteUFromAdmins(id){
    await deleteDoc(doc(db, "admins", id));
}
//Launch/Stop loader
function displayLoader(prop, loaderId){
    const loader = document.getElementById(loaderId);
    loader.style.display = prop;

}
//Get input values from cetified cards form
function getInputValues(){
    return {
        code : certifiedCForm['cardCode'].value,
        email : certifiedCForm['userEmail'].value,
        orderRef : certifiedCForm['cOrderRef'].value,
        cDate : certifiedCForm['cDate'].value,
        cGame : certifiedCForm['cGame'].value,
        ccLang : certifiedCForm['ccLang'].value,
        cName : certifiedCForm['cName'].value,
        cSet : certifiedCForm['cSet'].value,
        cLang : certifiedCForm['cLang'].value,
        cNote : certifiedCForm['cNote'].value,
        cCorners : certifiedCForm['cCorners'].value,
        cEdges : certifiedCForm['cEdges'].value,
        cCentering : certifiedCForm['cCentering'].value,
        cSurface : certifiedCForm['cSurface'].value,
    };
  }
//Add certified card to collection
async function addCertifiedCard(){

    //Get input values from the form
    const values = getInputValues();
    
    await setDoc(doc(db, "certified cards", values.code),{
        "user id": values.email,
        "certification date": values.cDate,
        "order reference": values.orderRef,
        "card game": values.cGame,
        "certification langage": values.ccLang,
        "card name": values.cName,
        "card set": values.cSet,
        "card langage": values.cLang,
        "grad": values.cNote,
        "corners": values.cCorners,
        "edges": values.cEdges,
        "centering": values.cCentering,
        "surface": values.cSurface
    });
}
//Get all certified cards from the collection
async function snapshotCertifiedCards(){
    const cardsList = document.querySelector('.certifiedCards__list');
    cardsList.innerHTML = `
    <li class="list__header">
        <span>Codigo</span>
        <span>ID de cliente</span>
        <span>Referencia del pedido</span>
        <span>Nombre</span>
        <span>Set</span>
        <span>Fecha de certificación</span>
        <span>Nota</span>
        <span>Editar</span>
    </li>
    `;
    const docs = await getDocs(collection(db, "certified cards"));

    docs.forEach((doc) => {
        //Display admin users collection data     
        const card = document.createElement('li');
        card.innerHTML = `
            <span>${doc.id}</span>
            <span>${doc.data()['user id']}</span>
            <span>${doc.data()['order reference']}</span>
            <span>${doc.data()['card name']}</span>
            <span>${doc.data()['card set']}</span>
            <span>${doc.data()['certification date']}</span>
            <span>${doc.data()['grad']}</span>
            <span>
                <img class="editBtn" src="images/icons/wtig-edit-icon.svg" alt="wtig-edit-icon">
            </span>
            `
        cardsList.append(card);
    });

    //Edit a certified card
    const cards = cardsList.querySelectorAll('.editBtn');
    cards.forEach(card =>{
        card.addEventListener('click', editCard);
    });
    
}
//Edit certified card
async function editCard(e){
    const currentCard = e.currentTarget.parentElement.parentElement;

    //Get the current card id
    const cardId = currentCard.firstElementChild.textContent;
    console.log (cardId);
    //Get data about that card from the collection
    getCardData(cardId)
    .then(cardSnap => {
        //Print it on the form
        PrintCardInfo(cardSnap);
        //Show the form
        ccList.style.display = 'none';
        certifiedCForm.style.display = 'block';
        showCForm.style.display = 'none';
    })
    
    

    //Get the data on the form (the updates)

    //Update the doc
}
//Get card data
async function getCardData(cardId){
    const cardRef = doc(db, "certified cards", cardId);
    const cardSnap = await getDoc(cardRef);

    if (cardSnap.exists()) {
        return cardSnap;
    }
    else {
        // doc.data() will be undefined in this case
        console.log("No such card");
    }
}
//Print card info on the form
function PrintCardInfo(cardSnap){
    certifiedCForm['cardCode'].value = cardSnap.id ;
    certifiedCForm['userEmail'].value = cardSnap.data()["user id"] ;
    certifiedCForm['cOrderRef'].value = cardSnap.data()["order reference"] ;
    certifiedCForm['cDate'].value = cardSnap.data()["certification date"] ;
    certifiedCForm['cGame'].value = cardSnap.data()["card game"] ;
    certifiedCForm['ccLang'].value = cardSnap.data()["certification langage"] ;
    certifiedCForm['cName'].value = cardSnap.data()["card name"] ;
    certifiedCForm['cSet'].value = cardSnap.data()["card set"] ;
    certifiedCForm['cLang'].value = cardSnap.data()["card langage"] ;
    certifiedCForm['cNote'].value = cardSnap.data()["grad"] ;
    certifiedCForm['cCorners'].value = cardSnap.data()["corners"] ;
    certifiedCForm['cEdges'].value = cardSnap.data()["edges"] ;
    certifiedCForm['cCentering'].value = cardSnap.data()["centering"] ;
    certifiedCForm['cSurface'].value = cardSnap.data()["surface"] ;
}
//Show Card list and hide the form
function displayCardsList(){
    //reset the form
    certifiedCForm.reset();
    //Hide the form
    certifiedCForm.style.display = 'none';

    //Show the list and the button
    ccList.style.display = 'block';
    showCForm.style.display = 'block';
}
//Snapshot orders list
async function snapshotOrders(){
    const ordersList = document.querySelector('.orders__list');
    ordersList.innerHTML = `
        <li class="list__header">
            <span>Referencia</span>
            <span>Fecha</span>
            <span>Email/Téléfono</span>
            <span>Número de tarjetas</span>
            <span>Premios</span>
            <span>Dirección</span>
            <span>Status</span>
        </li>
    `;
    const docs = await getDocs(collection(db, "orders"));

    docs.forEach((doc) => {
        //Display order collection data     
        const order = document.createElement('li');
        order.innerHTML = `
        <span>${doc.id}</span>
        <span>${doc.data()["date"]}</span>
        <span>
            ${doc.data()["email"]}<br>
            ${doc.data().adress.tel}
        </span>
        <span>${doc.data()["number of cards"]}</span>
        <span>${doc.data()["amount"]} €</span>
        <span>
            ${doc.data().adress.adress}<br>
            ${doc.data().adress.complement}<br>
            ${doc.data().adress.country} -
            ${doc.data().adress.city} -
            ${doc.data().adress["postal zip"]}
        </span>
        <select name="stauts" class="status">
            <option value="${doc.data()["status"]}">${doc.data()["status"]}</option>
            <option value="En espera">En espera</option>
            <option value="En el tratamiento">En el tratamiento</option>
            <option value="En proceso de envío">En proceso de envío</option>
            <option value="Entregado">Entregado</option>
            <option value="Anulado">Anulado</option>
        </select>
        `
        ordersList.append(order);
    });

    const status = ordersList.querySelector('.status');
    status.addEventListener('change', changeStatus);
}
//Change order status
async function changeStatus(e){
    const orderStatus = e.target.value;
    const orderId = e.target.parentElement.firstElementChild.textContent;

    const statusRef = doc(db, "orders", orderId);
    await updateDoc(statusRef, {
        status: orderStatus
    });

}
//Change order line style when status change
function lineStyle(status){

}
