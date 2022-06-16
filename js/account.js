import { 
    auth,
    onAuthStateChanged,
    signOut,
    updateProfile,
    db,
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,query, where,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    sendPasswordResetEmail 
} from "./modules/firebaseSdk.js";

//Call the getCurrentUser function
getCurrentUser().then(user => {
  getUserDoc(user.uid);
});

//Toggle modals 
const persoBtn = document.getElementById('menu__perso');
const orderBtn = document.getElementById('menu__orders');

orderBtn.addEventListener('click', () => {
    toggleModals('o');
});
persoBtn.addEventListener('click', ()=> {
  toggleModals('p');
});

 //Log out the user
 const logout = document.getElementById('menu__logout');
 logout.addEventListener('click', (e) => {
  logOut('index.html');
});

//Update Profile
const form = document.getElementById('modals__form');
form.addEventListener('submit', (e)=> {
  e.preventDefault();
  //Update the profile after getting uid
  getCurrentUser().then(user => {
    //Check user validity - Re-authentification
    reAuthUser(user);
  });
})

//Reset password mail
const pwdReset = document.getElementById('forgotten_pwd');
pwdReset.addEventListener('click', resetPwd);

/////////////////////////
////////Functions////////
////////////////////////

//Toggle modals
function toggleModals(flag){

  if(flag == 'o'){
    //Stylise the selected button
    orderBtn.classList.add('menu__item--selected');
    persoBtn.classList.remove('menu__item--selected');

    //Snapshot orders list
    snapshotOrders();
    //Hide perso modal
    displayPerso('none');
    //Show orders list
    displayOrder('flex');
  }

  else if(flag == 'p'){
    //Stylise the selected button
    orderBtn.classList.remove('menu__item--selected');
    persoBtn.classList.add('menu__item--selected');

    //Hide the orders list
    displayOrder('none');
    //Show perso info form
    displayPerso('flex');
  }
}
//Get user uid
function getCurrentUser(){
  return new Promise(resolve =>{
    onAuthStateChanged(auth, user => {
      if(user){
      }
      resolve(user);
  });
  })
}
//Display perso modal
function displayPerso(attribute){
  const modals__perso = document.getElementById('modals__perso');
  modals__perso.style.display = attribute;
}
//Display perso modal
function displayOrder(attribute){
  const modals__perso = document.getElementById('modals__order');
  modals__perso.style.display = attribute;
}
//Get user info from users collection
async function getUserDoc(uid){
  let fname = '';
  let lname = '';
  let email = '';
  let tel = '';
  
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    fname = docSnap.data()['first name'];
    lname = docSnap.data()['last name'];
    email = docSnap.data()['email'];
    tel = docSnap.data()['phone number'];
    //Printing the data
    printData(fname, lname,email, tel);
  } else {
    console.log("No such document!");
  }
}
//Print user info on the form
function printData(fn, ln, email, tel){
  const form = document.getElementById('modals__form');
  form['fname'].value = fn;
  form['lname'].value = ln;
  form['email'].value = email;
  form['tel'].value = tel;
}
//Guetting user inputs
function getInputValues(){
  return {
    fname : form['fname'].value,
    lname : form['lname'].value,
    email : form['email'].value,
    tel : form['tel'].value,
    cpwd : form['c_pwd'].value,
  };
}
//Update profile data (on the users collection and on the currentUser) + password
async function updateUProfile(user){

  //Getting the user infos
  const userInfo = getInputValues();

  //Update on the users collection
  try{
    await setDoc(doc(db, "users", user.uid), {
    "first name" : userInfo.fname,
    "last name" : userInfo.lname,
    "email" : userInfo.email,
    "phone number" : userInfo.tel
  });
  }catch(err){
    console.log('An has occured while updating the users collection');
    showError (err.code);
  }
  
  //Update on currentUser
  updateProfile(auth.currentUser, {
    displayName: userInfo.fname,
    email: userInfo.email
  })
  .then(() => {
    console.log('Profile updated');

    //Show success message
    showSucces('Profile updated !');

    //refresh the page
    setTimeout(()=>{
      location.reload(true);
    },3500);
  })
  .catch((err) => {

    showError(err.code);
    console.log('Error occured while updating Profile', err.message);
  });

  //Update password if new password field is not empty
  updatePwd(user);
}
//Update password 
function updatePwd(user){

  //Getting the new password value
  const n_pwd = form['n_pwd'].value;

  //Check if new password field is not empty
  if(n_pwd !== ''){

    updatePassword(user, n_pwd).then(() => {

      //Show a message
      showSucces('Password updated !');
      console.log('password updated');
    })
    .catch((err) => {

      showError(err.code);
      console.log('Error: ', err.message);
    });
  }
}
//Send a reset password mail
function resetPwd(){
  const email = form['email'].value;
  sendPasswordResetEmail(auth, email)

  .then(() => {

    //Show a success message
    showSucces('Se ha enviado un mensaje a su dirección de e-mail');
    //Logout
    setTimeout(()=>{
      logOut('register.html');
    }, 3500);  
  })

  .catch((err) => {
    showError(err.code)
    console.log(err);
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

  const email = getInputValues().email;
  const pwd = getInputValues().cpwd;
  //Get user credentials
  const credential = promptForCredentials(email,pwd);

  reauthenticateWithCredential(user, credential).then(() => {
    // User re-authenticated.
    console.log('User re-authenticated !');
    //Update the profile
    updateUProfile(user);
  }).catch((err) => {
    showError(err.code);
    console.log('An error occured when trying re-authenticated the user', err.message);
  });
}
//Logout user
function logOut(url){
  signOut(auth)
    .then(()=>{
        location.replace(url);
    }).catch(err => {
        console.log(err.message);
    })
}
//Show error message
function showError(errCode){
  switch(errCode) {
      case "auth/email-already-in-use":
        showErrorBloc('El email ya está en uso', 'email');
        break;
      case "auth/invalid-email":
        showErrorBloc('Email inválido', 'email');
        break;
      case "auth/user-not-found":
        showErrorBloc('Usuario no encontrado');
        break;
      case "auth/user-mismatch":
        showErrorBloc('La credencial dada no corresponde al usuario');
        break;
      case "auth/missing-email":
        showErrorBloc('Rellene la dirección de email', 'email');
        break;
      case "auth/weak-password":
        showErrorBloc('Contraseña débil, debe contener al menos 6 caracteres', 'npwd');
        break;
      case "auth/wrong-password":
        showErrorBloc('Contraseña incorrecta', 'pwd');
        break;
      case "Phone number not valid":
        showErrorBloc('Número de teléfono no válido', 'tel');
        break;
      default:
        showErrorBloc(errCode);
  }
}
//Show The error block
function showErrorBloc(msg, inputType, action){

  //Email input
  if (inputType == 'email'){

    //So it is a sign-up action
    const emailErr = document.getElementById('errorMessage_email');
    emailErr.style.visibility = 'visible';
    emailErr.innerHTML = msg;

    //Remove the error message after 3 secondes
    setTimeout(()=>{
      emailErr.style.visibility = 'hidden';
    }, 3000);
  }

  //Password input
  else if (inputType == 'pwd'){

    const pwdErr = document.getElementById('errorMessage_cpwd');
    pwdErr.style.visibility = 'visible';
    pwdErr.innerHTML = msg;

    //Remove the error message after 3 secondes
    setTimeout(()=>{
      pwdErr.style.visibility = 'hidden';
    }, 3000);
  }
  //Password input
  else if (inputType == 'npwd'){

    const pwdErr = document.getElementById('errorMessage_npwd');
    pwdErr.style.visibility = 'visible';
    pwdErr.innerHTML = msg;

    //Remove the error message after 3 secondes
    setTimeout(()=>{
      pwdErr.style.visibility = 'hidden';
    }, 3000);
  }

  //Telephon input
  else if (inputType == 'tel'){

      const telErr = document.getElementById('errorMessage_tel');
      telErr.style.visibility = 'visible';
      telErr.innerHTML = msg;

      //Remove the error message after 3 secondes
       setTimeout(()=>{
          telErr.style.visibility = 'hidden';
      }, 3000);
  }

  //Default error input
  else{
    const defaultErr = document.getElementById('form__defaultError');
    defaultErr.style.display = 'inline';
    defaultErr.innerHTML = msg;
          
    //Remove the error message after 3 secondes
    setTimeout(()=>{
      defaultErr.style.display = 'none';
    }, 3000); 
  }
}
//Show a success message
function showSucces(msg){
  const defaultErr = document.getElementById('form__defaultError');
  defaultErr.style.display = 'inline';
  defaultErr.style.backgroundColor = '#97cf8a';
  defaultErr.style.color = 'green';
  defaultErr.innerHTML = msg;
  setTimeout(()=>{
    defaultErr.style.display = 'none';
  }, 3000)
}
//Snapshot orders list
async function snapshotOrders(){

  const ordersList = document.querySelector('#orders__list');
    ordersList.innerHTML = `
      <li id="orders__header">
        <p>Referencia</p>
        <p>Fecha</p>
        <p>Número de tarjetas</p>
        <p>Premios</p>
        <p>Status</p>
    </li>
    `;

    //Get user uid
    getCurrentUser()
    .then(user =>{
      const uid = user.uid;
      //Query orders collection
      queryOrdersCollection(uid, ordersList);
    })
    .catch(err =>{
      console.log(err.message);
    });
}
//Query orders collection
async function queryOrdersCollection(uid, ordersList){

  const ordersRef = collection (db, "orders");
  const q = query(ordersRef, where("uid", "==", uid));
  
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const order = document.createElement('li');
    order.innerHTML = `
      <p>${doc.id}</p>
      <p>${doc.data()["date"]}</p>
      <p>${doc.data()["number of cards"]}</p>
      <p>${doc.data()["amount"]} €</p>
      <p>${doc.data()["status"]}</p>    
    `
    ordersList.append(order);
  });
}