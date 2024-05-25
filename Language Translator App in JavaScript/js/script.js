const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
exchageIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i");
translateBtn = document.querySelector("button"),

// hàm chọn ngôn ngữ 1 và ngôn ngữ 2
selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "vi-VN" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});
// hàm nút hoán đổi ngôn ngữ 1 và 2
exchageIcon.addEventListener("click", () => {
    // hàm swag như bth
    let tempText = fromText.value,
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});
// hàm làm trống, chưa hiểu chức năng mấy
fromText.addEventListener("keyup", () => {
    if(!fromText.value) {
        toText.value = "";
    }
});
// hàm API get
// async là đồng bộ hàm, để có thể gọi phương thức await 
// await cho phép chờ đợi khi nhận được response data từ API trả về để thực hiện tiếp trường trình mà không bị tắc nghẽn
// thực hiện xong hàm có await mới cho làm tiếp hàm khác, nên trươn trình chạy lần lượt, không bị lag hoặc đứng chương trình
async function fetchTranslation(text, translateFrom, translateTo) {
    // call KEY API bằng GET, vì chỉ cần có requset, chỉ có thể đọc data từ API đó th nên sài GET
    // còn nếu như có thay đổi gì ở data của API mới có thể POST, DELETE(xóa Data của API), PUT(bỏ dữ liệu vài API data)
    const apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
}
// hàm dịch khi nhân btn dịch
translateBtn.addEventListener("click", async () => {
    // khi nhân btn dịch, sẽ lấy nội dung từ textBox của ngôn ngữ English để gửi yêu cầu dịch
    let text = fromText.value.trim(),
    translateFrom = selectTag[0].value, // tiếng anh được setup là ngôn ngữ 0 ở hàm selectTag, ID == 0
    translateTo = selectTag[1].value;  // nếu như ở hàm selectTag ID != 0 sẽ set là ngôn ngữ ID == 1
    // nếu k có gì trong textBox English, không làm gì nữa
    if(!text) return;
    // call API get
    try {
        // đặt biến data để nhận reposne từ API về, data = fetchTranslate(gọi tới hàm get API, nhả response khi API trả dữ liệu ở đây)
        const data = await fetchTranslation(text, translateFrom, translateTo);
        // totext.value(nơi lấy dữ liệu từ data có chưa response ở đây)
        toText.value = data.responseData.translatedText;
        // duyệt qua các dối tượng response API trả về
        data.matches.forEach(match => {
            // hàm match để kiểm tra trong chuỗi có cái id == 0 hay không
            // nếu có id trong data(response của api) thì sẽ set cái totext(nội dung của ngôn ngữ 2)
            if (match.id === 0) {
                // xuất ra màn hình response value từ API qua biến toText.value
                // chưa hiểu cái match.translate làm mẹ gì
                toText.value = match.translation;
            }
        });
    // đặt try catch để hiện thị ra lỗi nếu sai
    } catch (error) {
        // lỗi nhả ra màn hình ở đây
        toText.value = "Error in translation";
    }
    toText.setAttribute("placeholder", "Translation");
});

// nút sao chép , nút đọc văn bản
icons.forEach(icon => {
    // các hàm như addEventListener, target, ... là các biến và hàm của thư viện DOM, hầu như cái hàm dùng DOM để xử lý hết
    //(Tìm hiểu thêm về thư viện của DOM nha ní có gì nói bạn)
    icon.addEventListener("click", ({target}) => {
        // nếu như văn bản trông, không làm gì
        if(!fromText.value || !toText.value) return;
        // hàm copy
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