import { functions, httpsCallable, auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    db, query, where, getDocs, addDoc,
    collection,
    doc, signOut, deleteDoc, setDoc} from "./modules/firebaseSdk.js";

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
        uid : certifiedCForm['userId'].value,
        cDate : certifiedCForm['cDate'].value,
        cGame : certifiedCForm['cDate'].value,
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
        "user id": values.uid,
        "certification date": values.cDate,
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
            <span>${doc.data()['card name']}</span>
            <span>${doc.data()['card set']}</span>
            <span>${doc.data()['certification date']}</span>
            <span>${doc.data()['grad']}</span>
            <span>
                <img src="images/icons/wtig-edit-icon.svg" alt="wtig-edit-icon">
            </span>
            `
        cardsList.append(card);
    });

    //Edit a certified card

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
