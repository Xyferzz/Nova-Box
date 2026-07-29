import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
    "https://tpjzhwgknhxrjucdhtce.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwanpod2drbmh4cmp1Y2RodGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNDA5NjAsImV4cCI6MjEwMDgxNjk2MH0.Oj1zc2lPbz9AfYxH2tML_eY0CG5_pwqdVQRPwNm_sgc"
);

const emailInput = document.getElementById("emailInput");
const sendBtn = document.getElementById("sendMagicLink");

const loginBox = document.getElementById("loginBox");
const apiBox = document.getElementById("apiBox");

const apiKeyInput = document.getElementById("apiKey");
const copyBtn = document.getElementById("copyApiKey");

sendBtn.onclick = async () => {

    const email = emailInput.value.trim();

    if (!email) {
        alert("Masukkan email terlebih dahulu.");
        return;
    }

    const { error } = await supabase.auth.signInWithOtp({

        email,

        options: {
            emailRedirectTo: window.location.origin + "/apikey.html"
        }

    });

    if (error) {
        alert(error.message);
    } else {
        alert("Magic Link berhasil dikirim. Silakan cek email.");
    }

};


async function loadApiKey() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) return;

    loginBox.style.display = "none";
    apiBox.style.display = "block";

    const email = session.user.email;

    const { data } = await supabase
        .from("api_keys")
        .select("*")
        .eq("email", email)
        .maybeSingle();

    if (data) {

        apiKeyInput.value = data.api_key;
        return;

    }

    const newKey = "NX-" + crypto.randomUUID();

    const { error } = await supabase
        .from("api_keys")
        .insert({
            email,
            api_key: newKey
        });

    if (error) {
        alert(error.message);
        return;
    }

    apiKeyInput.value = newKey;

}

copyBtn.onclick = () => {

    navigator.clipboard.writeText(apiKeyInput.value);

    copyBtn.innerText = "Copied ✅";

    setTimeout(() => {

        copyBtn.innerText = "Copy API Key";

    }, 2000);

};

loadApiKey();
