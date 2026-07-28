// ===========================
// NovaBox v1
// Powered by @Xyferzz
// ===========================

const supabaseUrl = "https://tpjzhwgknhxrjucdhtce.supabase.co";

const supabaseKey = "YOUR_ANON_KEY";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");

const preview = document.getElementById("preview");

const result = document.getElementById("result");

const urlResult = document.getElementById("urlResult");

const copyBtn = document.getElementById("copyBtn");

const progressArea = document.getElementById("progressArea");

const progressBar = document.getElementById("progressBar");

const progressText = document.getElementById("progressText");

let selectedFile = null;


// ===========================
// Preview File
// ===========================

fileInput.addEventListener("change", () => {

selectedFile = fileInput.files[0];

if(!selectedFile) return;

preview.innerHTML = "";

const url = URL.createObjectURL(selectedFile);

if(selectedFile.type.startsWith("image")){

preview.innerHTML = `
<img src="${url}">
`;

}

else if(selectedFile.type.startsWith("video")){

preview.innerHTML = `
<video
src="${url}"
controls>
</video>
`;

}

});

// ===========================
// Upload File
// ===========================

uploadBtn.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Pilih file terlebih dahulu!");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerText = "Uploading...";

    progressArea.style.display = "block";
    progressBar.style.width = "10%";
    progressText.innerText = "Preparing...";

    const ext = selectedFile.name.split(".").pop();

    const fileName =
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2,8) +
        "." +
        ext;

    progressBar.style.width = "35%";
    progressText.innerText = "Uploading...";

    const { error } = await supabaseClient
        .storage
        .from("novabox")
        .upload(fileName, selectedFile);

    if(error){

        uploadBtn.disabled = false;
        uploadBtn.innerText = "Upload Now";

        alert(error.message);

        return;

    }

    progressBar.style.width = "90%";
    progressText.innerText = "Generating URL...";

    const { data } = supabaseClient
        .storage
        .from("novabox")
        .getPublicUrl(fileName);

    progressBar.style.width = "100%";
    progressText.innerText = "Upload Complete";

    result.style.display = "block";

    urlResult.value = data.publicUrl;

    uploadBtn.disabled = false;
    uploadBtn.innerText = "Upload Now";

});

// ===========================
// Copy URL
// ===========================

copyBtn.addEventListener("click", async ()=>{

    await navigator.clipboard.writeText(urlResult.value);

    copyBtn.innerText = "Copied ✅";

    setTimeout(()=>{

        copyBtn.innerText="Copy URL";

    },2000);

});
