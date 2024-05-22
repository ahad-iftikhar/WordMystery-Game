const letters = document.querySelectorAll(".box");
const loadingDiv = document.querySelector(".loader");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;
let done = false;
let isLoading = true;

async function init(){
    let currentGuess = '';
    let currentRow = 0;

    const resp = await fetch('https://words.dev-apis.com/word-of-the-day?random=1');
    const respObj = await resp.json();
    const word = respObj.word.toUpperCase();
    const wordParts = word.split("");
    setLoading(false);
    isLoading = false;
    console.log(word);

    function addLetter(letter){
        if(currentGuess.length < ANSWER_LENGTH){
            // add letter to the end
            currentGuess += letter;
        }else{
            // replace the last letter
            currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerHTML = letter;
    }

    async function commit(){
        if(currentGuess.length != ANSWER_LENGTH){
            // do nothing
            return;
        }

        isLoading = true;
        setLoading(true);
        const res = await fetch('https://words.dev-apis.com/validate-word', {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const { validWord } = resObj;

        isLoading = false;
        setLoading(false);

        if(!validWord){
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);

        for(let i=0; i < ANSWER_LENGTH; i++){
            if(wordParts[i] === guessParts[i]){
                letters[ANSWER_LENGTH * currentRow + i].classList.add('correct');
                map[guessParts[i]]--;
            }
        }

        for(let i=0; i < ANSWER_LENGTH; i++){
            if(wordParts[i] === guessParts[i]){
                // do nothing
            }else if(wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
                letters[ANSWER_LENGTH * currentRow + i].classList.add('close');
                map[guessParts[i]]--;
            }else{
                letters[ANSWER_LENGTH * currentRow + i].classList.add('wrong');
            }
        }
        currentRow++;
        if(currentGuess === word){
            document.querySelector('.brand').classList.add('winner');
            setTimeout(() => {
                alert("You win.");
            }, 100);
            done = true;
            return;
        }else if(currentRow === ROUNDS){
            setTimeout(() => {
                alert(`You loose. Word is ${word}`);
            }, 100);
            done = true;
        }
        currentGuess = '';
    }


    function backSpace(){
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerHTML = "";
    }

    document.addEventListener("keydown", (event)=>{
        if(done || isLoading){
            return;
        }

        const action = event.key;

        if(action === 'Enter'){
            commit();
        }else if(action === 'Backspace'){
            backSpace();
        }else if(isLetter(action)){
            addLetter(action.toUpperCase());
        }else{
            // do nothing
        }
    })

    function markInvalidWord(){
        for(let i=0;i<ANSWER_LENGTH; i++){
            letters[ANSWER_LENGTH * currentRow + i].classList.remove('invalid');
    
            setTimeout(() => {
                letters[ANSWER_LENGTH * currentRow + i].classList.add('invalid');
            }, 10);
        }
    }
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function makeMap(array){
    const obj = {};
    for(let i=0; i < array.length; i++){
        const letter = array[i];
        if(obj[letter]){
            obj[letter]++;
        }else{
            obj[letter] = 1;
        }
    }

    return obj;
}

function setLoading(isLoading){
    loadingDiv.classList.toggle('show');
}

init();
