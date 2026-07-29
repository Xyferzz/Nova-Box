import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://tpjzhwgknhxrjucdhtce.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwanpod2drbmh4cmp1Y2RodGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDA5NjAsImV4cCI6MjEwMDgxNjk2MH0.Oj1zc2lPbz9AfYxH2tML_eY0CG5_pwqdVQRPwNm_sgc";

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

const {
    data: { session }
} = await supabase.auth.getSession();

if (session) {
    console.log("Login sebagai:", session.user.email);
}


const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");

const preview = document.getElementById("preview");

const result = document.getElementById("result");
const urlResult = document.getElementById("urlResult");
const copyBtn = document.getElementById("copyBtn");


let selectedFile = null;


// Preview file
fileInput.addEventListener("change", () => {

    selectedFile = fileInput.files[0];

    if(!selectedFile) return;

    const url = URL.createObjectURL(selectedFile);

    if(selectedFile.type.startsWith("image")){

        preview.innerHTML = `
        <img src="${url}">
        `;

    }else if(selectedFile.type.startsWith("video")){

        preview.innerHTML = `
        <video controls src="${url}"></video>
        `;

    }

});


// Upload
uploadBtn.addEventListener("click", async()=>{

    if(!selectedFile){
        showToast("Pilih file dulu!");
        return;
    }


    uploadBtn.innerText="Uploading...";


    const fileName =
    Date.now()+"-"+selectedFile.name;


    const {error}=await supabase
    .storage
    .from("NovaBox")
    .upload(fileName, selectedFile);


    if(error){

        showToast(error.message);
        uploadBtn.innerText="Upload Now";
        return;

    }


    const {data}=supabase
    .storage
    .from("NovaBox")
    .getPublicUrl(fileName);

    // Simpan data upload ke database

const code =
Math.random().toString(36).substring(2,8);

const { error: dbError } = await supabase
.from("files")
.insert({

    code: code,
    filename: fileName,
    url: data.publicUrl,
    type: selectedFile.type

});


if(dbError){

    console.log(dbError);
    showToast("File upload berhasil, tapi database gagal menyimpan");

}



    result.style.display="block";

    urlResult.value =
window.location.origin + "/f/" + code;


    uploadBtn.innerText="Upload Now";


});


// Copy URL
copyBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(
        urlResult.value
    );

    copyBtn.innerText="Copied ✅";


    setTimeout(()=>{

        copyBtn.innerText="Copy URL";

    },2000);

});

const popup = document.getElementById("loginPopup");

document.getElementById("getApiKeyBtn").onclick = () => {
    popup.style.display = "flex";
};

document.getElementById("closePopup").onclick = () => {
    popup.style.display = "none";
};

document.getElementById("sendMagicLink").onclick = async () => {

    const email = document.getElementById("emailInput").value;

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options:{
            emailRedirectTo: window.location.origin
        }
    });

    if(error){
        showToast(error.message);
         } else {
        showToast("Link berhasil dikirim! Silakan buka email lalu klik link login, ya mpruy!.");
        }

};

function showToast(message, type = "info") {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}
