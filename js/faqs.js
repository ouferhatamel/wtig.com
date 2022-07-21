let dropdown = document.querySelectorAll('.questionTitle img');

dropdown.forEach(drop =>{
    drop.addEventListener('click', e =>{
        const parentElm = e.currentTarget.parentElement.parentElement;
        const parags = parentElm.querySelectorAll('p');

        drop.classList.toggle("opened");

        parags.forEach(parag =>{
            parag.classList.toggle('shown');
        })
        
    })
})