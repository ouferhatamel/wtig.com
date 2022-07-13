console.log("hello from langage switcher")
fetch("./en.json",{
          Headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
       })
.then(response => {
   return response.json();
})
.then(jsondata => console.log(jsondata));