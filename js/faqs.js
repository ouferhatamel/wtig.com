let dropdown = document.querySelectorAll('.questionTitle img');

dropdown.forEach(drop =>{
    drop.addEventListener('click', e =>{
        
        const parentElm = e.currentTarget.parentElement.parentElement;
        const parags = parentElm.querySelectorAll('p');

        // Rotate the dropdown
        drop.classList.toggle("opened");

        // Show question paragraphs
        parags.forEach(parag =>{
            parag.classList.toggle('shown');
        });

        // Show lists inside paragraphs
        if(parentElm.querySelector("ol") != null){
            parentElm.querySelector("ol").classList.toggle('opened');
        }
        if(parentElm.querySelector("ul") != null){
            parentElm.querySelector("ul").classList.toggle('opened');
        }
    })
})