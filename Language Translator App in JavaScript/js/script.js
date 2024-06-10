const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
formTextHistory = document.querySelector(".from-text-history"),
toTextHistory = document.querySelector(".to-text-history"),
exchageIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button"),

selectTag.forEach((tag, id) => {
    for(let country_code in countries){
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "de-DE" ? "selected" : "";
        let option =   `<option ${selected} value = "${country_code}"> ${countries[country_code]} </option>`;
        tag.insertAdjacentHTML("beforeend" , option);
    }
});

exchageIcon.addEventListener("click" , () => {
    let tempText = fromText.value;
    fromText.value = toText.value;
    toText.value = tempText;

    let tempLang = selectTag[0].value;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
    if(!fromText.value) {
        toText.value = "";
    }
});

async function fecthTranslate(text, translateForm, translateTo){
    const apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateForm}|${translateTo}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
}

translateBtn.addEventListener("click", async ()=> {
    let formtext = fromText.value.trim();
    let translateForm = selectTag[0].value;
    let translateTo = selectTag[1].value;
   
    if (!formtext) return;
    try {
        const data = await fecthTranslate(formtext, translateForm, translateTo);
        toText.value = data.responseData.translatedText;
        if (Array.isArray(data.matches)) {
            data.matches.forEach(match => {
                if (match.id == 0) {
                    toText.value = match.translation;
                }
            });
        }
        toggleData(formtext,toText.value);
        getData();
    } catch (error) {
        toText.value = "Lỗi : " + error;
    }
});
// set object trong localS
function toggleData(formText , toText) {
    let Lists = JSON.parse(localStorage.getItem('Lists')) || [];
    Lists.push({
        formText : formText,
        toText : toText
    });
    localStorage.setItem('Lists', JSON.stringify(Lists));
}
// get object trong localS
function getData(){
    let Lists = JSON.parse(localStorage.getItem('Lists')) || [];
    let ListForm = "";
    let ListTo = "";
    Lists.forEach(item =>{
        ListForm += item.formText + "\n",
        ListTo += item.toText + "\n"
    })
    formTextHistory.value = ListForm.trim();
    toTextHistory.value = ListTo.trim();
    console.log(ListForm);
    console.log(ListTo);
}

icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(!fromText.value || !toText.value) return;
        if(target.classList.contains("fa-copy")) {
            if(target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        } else {
            // hàm đọc văn bản
            let utterance;
            if(target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});