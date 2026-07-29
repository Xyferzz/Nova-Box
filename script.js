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


document.getElementById("getApiKeyBtn").onclick = async () => {

    const {
        data:{session}
    } = await supabase.auth.getSession();


    if(session){

        const key = await getApiKey();

        showToast("API Key siap!", "success");

        console.log("API KEY:", key);

    }else{

        popup.style.display = "flex";

    }

};


document.getElementById("closePopup").onclick = () => {
    popup.style.display = "none";
};


let magicCooldown = false;

document.getElementById("sendMagicLink").onclick = async () => {

    if(magicCooldown){
        showToast("Tunggu sebentar sebelum kirim ulang!", "error");
        return;
    }


    const email = document.getElementById("emailInput").value;


    if(!email){

        showToast("Masukkan email dulu!", "error");
        return;

    }


    magicCooldown = true;

    const btn = document.getElementById("sendMagicLink");

    btn.disabled = true;


    let time = 60;


    const timer = setInterval(()=>{

        btn.innerText = `Tunggu ${time}s`;

        time--;


        if(time < 0){

            clearInterval(timer);

            btn.disabled = false;

            btn.innerText = "Kirim Magic Link";

            magicCooldown = false;

        }

    },1000);



    const { error } = await supabase.auth.signInWithOtp({

        email,

        options:{
            emailRedirectTo: window.location.origin + "?getApiKey=true"
        }

    });



    if(error){

        showToast(error.message, "error");

    }else{

        showToast(
            "Link berhasil dikirim! Cek email kamu.",
            "success"
        );

    }

};
    



// Buat / ambil API Key

async function getApiKey(){

    const {
        data:{session}
    } = await supabase.auth.getSession();


    if(!session){

        showToast("Belum login!", "error");
        return;

    }


    const email = session.user.email;


    const { data: existing, error } = await supabase

    .from("api_keys")

    .select("*")

    .eq("email", email)

    .single();



    if(existing){

        return existing.api_key;

    }



    const newKey =
    "NX-" + crypto.randomUUID();



    const { error: insertError } = await supabase

    .from("api_keys")

    .insert({

        email: email,

        api_key: newKey

    });



    if(insertError){

        showToast(insertError.message,"error");
        return;

    }


    return newKey;

}




function showToast(message, type = "info") {

    const toast = document.getElementById("toast");


    toast.textContent = message;


    toast.className = `toast ${type} show`;


    setTimeout(() => {

        toast.classList.remove("show");

    },3000);

}

const params = new URLSearchParams(window.location.search);

if (params.get("getApiKey") === "true") {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (session) {

        const key = await getApiKey();

        if (key) {

            popup.style.display = "flex";

            document.querySelector(".popup-box").innerHTML = `
                <h2>🎉 API Key Berhasil Dibuat</h2>

                <input
                    type="text"
                    id="generatedKey"
                    value="${key}"
                    readonly>

                <button id="copyGeneratedKey">
                    Copy API Key
                </button>
            `;

            document
            .getElementById("copyGeneratedKey")
            .onclick = () => {

                navigator.clipboard.writeText(key);

                showToast("API Key berhasil disalin!", "success");

            };

        }

    }

}
